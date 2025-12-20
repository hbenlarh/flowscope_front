import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfile } from '../user-profile/user-profile';
import { Button } from '../../shared/button/button';
import { OfferService } from '../../services/offer/offer';
import { CategoryService, Category } from '../../services/category/category';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ContainerService, Container } from '../../services/container/container.service';
import { UserMenu } from '../user-menu/user-menu';
import { AdminFooter } from '../../shared/admin-footer/admin-footer';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { HttpClient } from '@angular/common/http';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  featuresText?: string;
}

@Component({
  selector: 'app-user-offre',
  imports: [ReactiveFormsModule, FormsModule, Button, CommonModule, UserMenu, AdminFooter, DashboardHeader],
  templateUrl: './user-offre.html',
  styleUrl: './user-offre.scss'
})
export class UserOffre implements OnInit {
  @ViewChild('editorContent') editorContent!: ElementRef;
  
  offreForm: FormGroup;
  categories: Category[] = [];
  containers: Container[] = [];
  
  features: Feature[] = [];
  pros: string[] = [];
  cons: string[] = [];
  pricingTiers: PricingTier[] = [];
  
  screenshotPreview: string | null = null;
  currentLogoUrl: string | null = null;
  
  capturingScreenshot = false;
  fetchingLogo = false;

  constructor(
    private ContainerService: ContainerService,
    private categoryService: CategoryService,
    private offerService: OfferService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.offreForm = this.fb.group({
      name: ['', Validators.required],
      category_id: ['', Validators.required], 
      description: ['', [Validators.required, Validators.maxLength(255)]],
      url: ['', [Validators.required, Validators.pattern('https?://(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')]],
      file_name: ['', Validators.required],
      file_base64: ['', Validators.required],
      slug: ['', Validators.required],
      subtitle: [''],
      long_description: [''],
      screenshot_url: [''],
      ranking: [0],
      is_verified: [false],
      features: [''],
      pros: [''],
      cons: [''],
      pricing_tiers: ['']
    });

    // Auto-generate slug from name
    this.offreForm.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        const slug = this.generateSlug(name);
        this.offreForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // WYSIWYG Editor methods
  formatText(command: string) {
    document.execCommand(command, false);
  }

  formatHeading(tag: string) {
    document.execCommand('formatBlock', false, tag);
  }

  onEditorInput(event: any) {
    const content = event.target.innerHTML;
    this.offreForm.patchValue({ long_description: content });
  }

  onScreenshotSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.screenshotPreview = base64String;
        this.offreForm.patchValue({ screenshot_url: base64String });
      };
      reader.readAsDataURL(file);
    }
  }

  addFeature() {
    this.features.push({ icon: '', title: '', description: '' });
  }

  removeFeature(index: number) {
    this.features.splice(index, 1);
  }

  addPro() {
    this.pros.push('');
  }

  removePro(index: number) {
    this.pros.splice(index, 1);
  }

  addCon() {
    this.cons.push('');
  }

  removeCon(index: number) {
    this.cons.splice(index, 1);
  }

  addPricingTier() {
    this.pricingTiers.push({ 
      name: '', 
      price: 0, 
      description: '', 
      features: [],
      featuresText: ''
    });
  }

  removePricingTier(index: number) {
    this.pricingTiers.splice(index, 1);
  }

  onSubmit() {
    if (this.offreForm.valid) {
      // Process pricing tiers - convert comma-separated features to arrays
      const processedPricingTiers = this.pricingTiers.map((tier: PricingTier) => ({
        name: tier.name,
        price: tier.price,
        description: tier.description,
        features: tier.featuresText ? tier.featuresText.split(',').map((f: string) => f.trim()).filter((f: string) => f) : []
      }));

      // Filter out empty features
      const validFeatures = this.features.filter((f: Feature) => f.title && f.description);
      const validPros = this.pros.filter((p: string) => p.trim());
      const validCons = this.cons.filter((c: string) => c.trim());

      const payload = {
        ...this.offreForm.value,
        category_id: Number(this.offreForm.value.category_id),
        ranking: 0,
        is_verified: false,
        features: validFeatures.length > 0 ? JSON.stringify(validFeatures) : null,
        pros: validPros.length > 0 ? JSON.stringify(validPros) : null,
        cons: validCons.length > 0 ? JSON.stringify(validCons) : null,
        pricing_tiers: processedPricingTiers.length > 0 ? JSON.stringify(processedPricingTiers) : null
      };
      
      console.log('Submitting payload:', payload);

      this.offerService.createOffer(payload).subscribe({
        next: (res: any) => {
          console.log('Offer created successfully:', res);
          alert('Offer created successfully!');
          this.offreForm.reset();
          this.features = [];
          this.pros = [];
          this.cons = [];
          this.pricingTiers = [];
        },
        error: (err: any) => {
          console.error('Error creating offer:', err.error);
          alert('Failed to create offer: ' + (err.error?.detail || 'Unknown error'));
        }
      });
    } else {
      alert('Please fill all required fields (marked with *)');
    }
  }

  async autoFetchLogo() {
    const url = this.offreForm.value.url;
    if (!url) {
      alert('Please enter a URL first');
      return;
    }

    try {
      this.fetchingLogo = true;
      
      // Extract domain from URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Fetch logo from logo.dev with retina quality
      const logoUrl = `https://img.logo.dev/${domain}?token=pk_XaoF3YcvQmqiO0PE0jfXvg&retina=true`;
      
      // Fetch the image
      const response = await fetch(logoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch logo');
      }
      
      // Convert to blob and then to base64
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const fileName = `${domain}-logo.png`;
        
        // Extract just the base64 data without the prefix
        const base64Content = base64data.split(',')[1];
        
        // Update form with logo data
        this.offreForm.patchValue({
          file_name: fileName,
          file_base64: base64Content
        });
        this.offreForm.markAsDirty();
        
        // Update preview
        this.currentLogoUrl = base64data;
        this.fetchingLogo = false;
        alert('Logo fetched successfully!');
      };
      
      reader.onerror = () => {
        this.fetchingLogo = false;
        alert('Failed to process logo image');
      };
      
      reader.readAsDataURL(blob);
      
    } catch (error) {
      console.error('Logo fetch error:', error);
      this.fetchingLogo = false;
      alert('Failed to fetch logo. The domain might not be available in logo.dev database.');
    }
  }

  captureScreenshot() {
    const url = this.offreForm.value.url;
    if (!url) {
      alert('Please enter a URL first');
      return;
    }

    this.capturingScreenshot = true;

    this.http.post<{ screenshot_url: string }>(
      'http://localhost:8000/api/flowscope_core/offer/screenshot',
      { url },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.screenshotPreview = response.screenshot_url;
        this.offreForm.patchValue({ screenshot_url: response.screenshot_url });
        this.offreForm.markAsDirty();
        this.capturingScreenshot = false;
        alert('Screenshot captured successfully!');
      },
      error: (err) => {
        console.error('Screenshot capture error:', err);
        this.capturingScreenshot = false;
        alert('Failed to capture screenshot: ' + (err.error?.detail || 'Unknown error'));
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.offreForm.patchValue({ file_name: file.name });

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // remove "data:image/png;base64,"
        this.offreForm.patchValue({ file_base64: base64String });
        this.currentLogoUrl = reader.result as string;
        this.offreForm.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit() {
    forkJoin({
      categories: this.categoryService.getCategories(),
      containers: this.ContainerService.getContainers()
    }).subscribe({
      next: ({ categories, containers }) => {
        this.containers = containers.map((container: Container) => ({
          ...container,
          categories: categories.filter((cat: Category) => cat.container_id === container.container_id)
        }));
      },
      error: (err: any) => console.error('Failed to load data', err)
    });
  }
}
