import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Menu } from '../menu/menu';
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
  selector: 'app-edit-offer',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, Menu, AdminFooter, DashboardHeader],
  templateUrl: './edit-offer.component.html',
  styleUrl: './edit-offer.component.scss'
})
export class EditOfferComponent implements OnInit {
  @ViewChild('editorContent') editorContent!: ElementRef;
  
  offerForm: FormGroup;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private containerService: ContainerService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.offerForm = this.fb.group({
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
      ranking: [0],
      is_verified: [false],
      features: [''],
      pros: [''],
      cons: [''],
      pricing_tiers: ['']
    });

    // Auto-generate slug from name
    this.offerForm.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        const slug = this.generateSlug(name);
        this.offerForm.patchValue({ slug }, { emitEvent: false });
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
        
        // Load offer data after categories are loaded
        this.loadOffer();
      },
      error: (err) => console.error('Failed to load data', err)
    });
  }

  loadOffer() {
    if (!this.offerId) return;
    
    this.loading = true;
    this.http.get<any>(`https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer/id/${this.offerId}`, { withCredentials: true })
      .subscribe({
        next: (offer) => {
          // Set form values
          this.offerForm.patchValue({
            name: offer.name || '',
            category_id: offer.category_id || '',
            description: offer.description || '',
            url: offer.url || '',
            slug: offer.slug || '',
            subtitle: offer.subtitle || '',
            long_description: offer.long_description || '',
            ranking: offer.ranking || 0,
            is_verified: offer.is_verified || false
          });

          // Set current images
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

          // Load features
          if (offer.features) {
            try {
              this.features = Array.isArray(offer.features) ? offer.features : JSON.parse(offer.features);
            } catch (e) {
              console.error('Error parsing features:', e);
              this.features = [];
            }
          }

          // Load pros/cons
          if (offer.pros) {
            try {
              this.pros = Array.isArray(offer.pros) ? offer.pros : JSON.parse(offer.pros);
            } catch (e) {
              console.error('Error parsing pros:', e);
              this.pros = [];
            }
          }
          if (offer.cons) {
            try {
              this.cons = Array.isArray(offer.cons) ? offer.cons : JSON.parse(offer.cons);
            } catch (e) {
              console.error('Error parsing cons:', e);
              this.cons = [];
            }
          }

          // Load pricing tiers
          if (offer.pricing_tiers) {
            try {
              const tiers = Array.isArray(offer.pricing_tiers) ? offer.pricing_tiers : JSON.parse(offer.pricing_tiers);
              this.pricingTiers = tiers.map((tier: PricingTier) => ({
                ...tier,
                featuresText: Array.isArray(tier.features) ? tier.features.join(', ') : ''
              }));
            } catch (e) {
              console.error('Error parsing pricing tiers:', e);
              this.pricingTiers = [];
            }
          }

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

  // WYSIWYG Editor methods
  formatText(command: string) {
    document.execCommand(command, false);
  }

  formatHeading(tag: string) {
    document.execCommand('formatBlock', false, tag);
  }

  onEditorInput(event: any) {
    const content = event.target.innerHTML;
    this.offerForm.patchValue({ long_description: content });
  }

  onScreenshotSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.screenshotPreview = base64String;
        this.offerForm.patchValue({ screenshot_url: base64String });
      };
      reader.readAsDataURL(file);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.offerForm.patchValue({ file_name: file.name });

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.offerForm.patchValue({ file_base64: base64String });
        this.currentLogoUrl = reader.result as string;
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
    if (!this.offerForm.valid || !this.offerId) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;

    // Process pricing tiers
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

    const payload: any = {
      offer_id: this.offerId,
      name: this.offerForm.value.name,
      category_id: Number(this.offerForm.value.category_id),
      description: this.offerForm.value.description,
      url: this.offerForm.value.url,
      slug: this.offerForm.value.slug,
      subtitle: this.offerForm.value.subtitle || null,
      long_description: this.offerForm.value.long_description || null,
      ranking: Number(this.offerForm.value.ranking) || 0,
      is_verified: Boolean(this.offerForm.value.is_verified),
      features: validFeatures.length > 0 ? JSON.stringify(validFeatures) : null,
      pros: validPros.length > 0 ? JSON.stringify(validPros) : null,
      cons: validCons.length > 0 ? JSON.stringify(validCons) : null,
      pricing_tiers: processedPricingTiers.length > 0 ? JSON.stringify(processedPricingTiers) : null
    };

    // Add file data only if new file was uploaded
    if (this.offerForm.value.file_name && this.offerForm.value.file_base64) {
      payload.file_name = this.offerForm.value.file_name;
      payload.file_base64 = this.offerForm.value.file_base64;
    }

    // Add screenshot only if changed
    if (this.screenshotPreview) {
      payload.screenshot_url = this.offerForm.value.screenshot_url;
    }

    this.http.put(`https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer/${this.offerId}`, payload, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('Offer updated successfully!');
          this.loading = false;
          this.router.navigate(['/admin/offers']);
        },
        error: (err: any) => {
          console.error('Error updating offer:', err);
          alert('Failed to update offer: ' + (err.error?.detail || 'Unknown error'));
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/admin/offers']);
  }
}
