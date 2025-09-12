import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfile } from '../user-profile/user-profile';
import { Button } from '../../shared/button/button';
import { OfferService } from '../../services/offer/offer';
import { CategoryService, Category } from '../../services/category/category';

@Component({
  selector: 'app-user-offre',
  imports: [ReactiveFormsModule, UserProfile, Button],
  templateUrl: './user-offre.html',
  styleUrl: './user-offre.scss'
})
export class UserOffre {
  offreForm: FormGroup;
  categories: Category[] = [];

  constructor(private categoryService: CategoryService, private offerService: OfferService, private fb: FormBuilder) {
    this.offreForm = this.fb.group({
      name: ['', Validators.required],
      categorie: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      file_name: ['', Validators.required],
      file_base64: ['', Validators.required] // here you’ll set the base64 string
    },);
  }

  onSubmit() {
    if (this.offreForm.valid) {
      const payload = {
        ...this.offreForm.value,
        category_id: Number(this.offreForm.value.category_id) // ensure number
      };
      console.log('Submitting payload:', payload);

      this.offerService.createOffer(payload).subscribe({
        next: (res) => {
          console.log('Offer created successfully:', res);
          alert('Offer created successfully!');
          this.offreForm.reset();
        },
        error: (err) => {
          console.error('Error creating offer:', err.error);
          alert('Failed to create offer');
        }
      });
    }
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.offreForm.patchValue({ file_name: file.name });

      const reader = new FileReader();
      reader.onload = () => {
        this.offreForm.patchValue({ file_base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

}
