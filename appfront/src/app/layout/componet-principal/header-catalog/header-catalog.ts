import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header-catalog',
  imports: [FormsModule],
  templateUrl: './header-catalog.html',
  styleUrl: './header-catalog.css',
})
export class HeaderCatalog {
  value: string = '';

  onSearch() {
    console.log(this.value);
  }
}
