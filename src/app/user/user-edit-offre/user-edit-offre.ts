import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { UserMenu } from '../user-menu/user-menu';
import { AdminFooter } from '../../shared/admin-footer/admin-footer';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { CategoryService, Category } from '../../services/category/category';
import { ContainerService, Container } from '../../services/container/container.service';

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
  selector: 'app-user-edit-offre',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, UserMenu, AdminFooter, DashboardHeader],
  templateUrl: './user-edit-offre.html',
  styleUrl: './user-edit-offre.scss'
})
export class UserEditOffre implements OnInit {
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
  currentScreenshotUrl: string | null = null;
  
  offerId: number | null = null;
  loading = false;
  capturingScreenshot = false;
  fetchingLogo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private containerService: ContainerService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.offreForm = this.fb.group({
      name: ['', Validators.required],
      category_id: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      url: ['', [Validators.required, Validators.pattern('https?://(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')]],
      file_name: [''],
      file_base64: [''],
      slug: ['', Validators.required],
      subtitle: [''],
      long_description: [''],
      screenshot_url: [''],
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

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    
    forkJoin({
      categories: this.categoryService.getCategories(),
      containers: this.containerService.getContainers()
    }).subscribe({
      next: ({ categories, containers }) => {
        this.containers = containers.map((container: Container) => ({
          ...container,
          categories: categories.filter((cat: Category) => cat.container_id === container.container_id)
        }));
        
        this.loadOffer();
      },
      error: (err) => console.error('Failed to load data', err)
    });
  }

  loadOffer() {
    if (!this.offerId) return;
    
    this.loading = true;
    this.http.get<any>(`http://localhost:8000/api/flowscope_core/offer/id/${this.offerId}`, { withCredentials: true })
      .subscribe({
        next: (offer) => {
          this.offreForm.patchValue({
            name: offer.name || '',
            category_id: offer.category_id || '',
            description: offer.description || '',
            url: offer.url || '',
            slug: offer.slug || '',
            subtitle: offer.subtitle || '',
            long_description: offer.long_description || ''
          });

          if (offer.file) {
            const ext = String(offer.file_extension || '').toLowerCase();
            let mime = 'image/png';
            if (ext === '.svg') mime = 'image/svg+xml';
            else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
            this.currentLogoUrl = `data:${mime};base64,${offer.file}`;
          }

          if (offer.screenshot_url) {
            this.currentScreenshotUrl = offer.screenshot_url;
          }

          if (offer.features) {
            this.features = Array.isArray(offer.features) ? offer.features : JSON.parse(offer.features);
          }

          if (offer.pros) {
            this.pros = Array.isArray(offer.pros) ? offer.pros : JSON.parse(offer.pros);
          }
          if (offer.cons) {
            this.cons = Array.isArray(offer.cons) ? offer.cons : JSON.parse(offer.cons);
          }

          if (offer.pricing_tiers) {
            const tiers = Array.isArray(offer.pricing_tiers) ? offer.pricing_tiers : JSON.parse(offer.pricing_tiers);
            this.pricingTiers = tiers.map((tier: PricingTier) => ({
              ...tier,
              featuresText: Array.isArray(tier.features) ? tier.features.join(', ') : ''
            }));
          }

          // Reset form state after loading data
          this.offreForm.markAsPristine();
          this.offreForm.markAsUntouched();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading offer:', err);
          alert('Failed to load offer');
          this.loading = false;
          this.goBack();
        }
      });
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

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
        this.offreForm.markAsDirty(); // Mark form as modified
      };
      reader.readAsDataURL(file);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.offreForm.patchValue({ file_name: file.name });

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.offreForm.patchValue({ file_base64: base64String });
        this.currentLogoUrl = reader.result as string;
        this.offreForm.markAsDirty(); // Mark form as modified
      };
      reader.readAsDataURL(file);
    }
  }

  addFeature() {
    this.features.push({ icon: '', title: '', description: '' });
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  removeFeature(index: number) {
    this.features.splice(index, 1);
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  addPro() {
    this.pros.push('');
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  removePro(index: number) {
    this.pros.splice(index, 1);
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  addCon() {
    this.cons.push('');
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  removeCon(index: number) {
    this.cons.splice(index, 1);
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  addPricingTier() {
    this.pricingTiers.push({
      name: '',
      price: 0,
      description: '',
      features: [],
      featuresText: ''
    });
    this.offreForm.markAsDirty(); // Mark form as modified
  }

  removePricingTier(index: number) {
    this.pricingTiers.splice(index, 1);
    this.offreForm.markAsDirty(); // Mark form as modified
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
        this.offreForm.markAsDirty(); // Mark form as modified
        
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
      'https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer/screenshot',
      { url },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.screenshotPreview = response.screenshot_url;
        this.offreForm.patchValue({ screenshot_url: response.screenshot_url });
        this.offreForm.markAsDirty(); // Mark form as modified
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

  onSubmit() {
    if (!this.offreForm.valid || !this.offerId) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;

    const processedPricingTiers = this.pricingTiers.map((tier: PricingTier) => ({
      name: tier.name,
      price: tier.price,
      description: tier.description,
      features: tier.featuresText ? tier.featuresText.split(',').map((f: string) => f.trim()).filter((f: string) => f) : []
    }));

    const validFeatures = this.features.filter((f: Feature) => f.title && f.description);
    const validPros = this.pros.filter((p: string) => p.trim());
    const validCons = this.cons.filter((c: string) => c.trim());

    const payload: any = {
      offer_id: this.offerId,
      name: this.offreForm.value.name,
      category_id: Number(this.offreForm.value.category_id),
      description: this.offreForm.value.description,
      url: this.offreForm.value.url,
      slug: this.offreForm.value.slug,
      subtitle: this.offreForm.value.subtitle || null,
      long_description: this.offreForm.value.long_description || null,
      ranking: 0,
      is_verified: false,
      features: validFeatures.length > 0 ? JSON.stringify(validFeatures) : null,
      pros: validPros.length > 0 ? JSON.stringify(validPros) : null,
      cons: validCons.length > 0 ? JSON.stringify(validCons) : null,
      pricing_tiers: processedPricingTiers.length > 0 ? JSON.stringify(processedPricingTiers) : null,
      file_name: this.offreForm.value.file_name || null,
      file_base64: this.offreForm.value.file_base64 || null,
      screenshot_url: this.screenshotPreview ? this.offreForm.value.screenshot_url : null
    };

    this.http.put(`http://localhost:8000/api/flowscope_core/offer/${this.offerId}`, payload, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('Offer updated successfully!');
          this.loading = false;
          this.router.navigate(['/user/myoffers']);
        },
        error: (err: any) => {
          console.error('Error updating offer:', err);
          alert('Failed to update offer: ' + (err.error?.detail || 'Unknown error'));
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/user/myoffers']);
  }
}
