import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, Header, Footer, ReactiveFormsModule, TranslateModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
    contactForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private translate: TranslateService
    ) {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            company: [''],
            reason: ['General Inquiry', Validators.required],
            message: ['', Validators.required]
        });
    }

    ngOnInit() { }

    onSubmit() {
        if (this.contactForm.valid) {
            console.log(this.contactForm.value);
            alert('Message sent successfully!');
            this.contactForm.reset();
        } else {
            this.contactForm.markAllAsTouched();
        }
    }
}
