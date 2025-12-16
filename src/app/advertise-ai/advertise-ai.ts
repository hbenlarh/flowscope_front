import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { Button } from '../shared/button/button';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonClass?: string;
}

@Component({
  selector: 'app-advertise-ai',
  imports: [Header, Footer, CommonModule, Button],
  templateUrl: './advertise-ai.html',
  styleUrl: './advertise-ai.scss'
})
export class AdvertiseAI {

  pricingPlans: PricingPlan[] = [
    {
      id: 'quick-boost',
      name: 'Quick Boost',
      description: 'Perfect for short advertising campaigns',
      price: 399,
      duration: '3 Days',
      icon: 'bi-lightning-charge',
      features: [
        'Featured for 3 days',
        'Gold checkmark status',
        'Premium support included',
        'Display on competitor pages',
        'Indexed on Google'
      ],
      buttonText: 'Get Started',
      buttonClass: 'btn-primary'
    },
    {
      id: 'standard-promotion',
      name: 'Standard Promotion',
      description: 'Ideal for medium-term visibility',
      price: 899,
      duration: '7 Days',
      icon: 'bi-clock',
      features: [
        'Featured for 7 days',
        'Gold checkmark status',
        'Premium support included',
        'Display on competitor pages',
        'Indexed on Google'
      ],
      buttonText: 'Contact Us',
      buttonClass: 'btn-primary',
      isPopular: true
    },
    {
      id: 'extended-visibility',
      name: 'Extended Visibility',
      description: 'Maximum exposure for your AI service',
      price: 1799,
      duration: '15 Days',
      icon: 'bi-bullseye',
      features: [
        'Featured for 15 days',
        'Gold checkmark status',
        'Premium support included',
        'Display on competitor pages',
        'Indexed on Google'
      ],
      buttonText: 'Contact Us',
      buttonClass: 'btn-primary'
    }
  ];

  selectPlan(plan: PricingPlan) {
    console.log('Selected plan:', plan.name);

    if (plan.buttonText === 'Get Started') {
      // Handle direct payment for Quick Boost
      this.handlePayment(plan);
    } else {
      // Handle contact form for other plans
      this.handleContact(plan);
    }
  }

  private handlePayment(plan: PricingPlan) {
    alert(`Redirecting to payment for ${plan.name} - $${plan.price}`);
  }

  private handleContact(plan: PricingPlan) {
    alert(`Contact us for ${plan.name} - $${plan.price}`);
  }
}


