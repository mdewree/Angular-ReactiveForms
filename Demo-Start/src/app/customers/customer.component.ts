import { Component, OnInit } from '@angular/core';
import { Customer } from './customer';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ratingRange } from './ratingRange';
import { emailMatcher } from './emailMatcher';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage;
  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };

  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }

  constructor(private builder: FormBuilder) { }

  ngOnInit() {
    this.customerForm = this.builder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.builder.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required]
      }, { validator: emailMatcher }),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addresses: this.builder.array([this.buildAddress()])
    });

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    );
  }

  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Mich',
      lastName: 'De Wree',
      email: 'mich@ordina.be',
      sendCatalog: false
    });
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators([Validators.required]);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.emailMessage += this.validationMessages[key]).join('');
    }
  }

  buildAddress(): FormGroup {
    return this.builder.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      zip: ''
    });
  }

  addAddress(): void {
    this.addresses.push(this.buildAddress());
  }
}
