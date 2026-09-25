import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-form',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatListModule, MatButtonModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class FormPage {
  email = '';
  shipping = ['standard'];
}
