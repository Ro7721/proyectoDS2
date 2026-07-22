import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeaderCatalog } from "../../../layout/componet-principal/header-catalog/header-catalog";
import { CourseModal } from "../../../layout/componet-principal/course-modal/course-modal";
import { CourseResponse } from '../../../models/course.model';
import { Api } from '../../../api/api';
import { getAll1, getAllCourses } from '../../../api/functions';
import { CommonModule } from '@angular/common';
import { CategoryResponse } from '../../../models/category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalog',
  imports: [HeaderCatalog, CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private changeDetectorRef = inject(ChangeDetectorRef);
  constructor(
    private api: Api,
    private router: Router
  ) { }

  loading = false;
  searchText = '';
  filtersOpen = false;
  categories: CategoryResponse[] = [];
  courses: CourseResponse[] = [];
  filteredCourses: CourseResponse[] = [];
  selectedCategories: string[] = [];
  selectedSort = 'Relevancia';

  readonly sortOptions = [
    'Relevancia',
    'Menor Precio',
    'Mayor Precio'
  ];



  ngOnInit(): void {
    this.loadCategories();
    this.loadCourses();
  }
  lessonOption(level: string): string {
    switch (level) {
      case 'BASIC':
        return 'Básico';
      case 'INTERMEDIATE':
        return 'Intermedio';
      case 'ADVANCED':
        return 'Avanzado';
      default:
        return level;
    }
  }
  //---------------------------------------------------
  // CARGA DATOS
  //---------------------------------------------------

  loadCategories(): void {
    this.api.invoke(getAll1).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;
      if (Array.isArray(apiResponseData)) {
        this.categories = apiResponseData;
      } else if (apiResponseData && Array.isArray(apiResponseData.data)) {
        this.categories = apiResponseData.data;
      }
      this.changeDetectorRef.detectChanges();
    }).catch((error) => {
      console.error(error);
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.api.invoke(getAllCourses).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;
      if (Array.isArray(apiResponseData)) {
        this.courses = apiResponseData;
      } else if (apiResponseData && Array.isArray(apiResponseData.data)) {
        this.courses = apiResponseData.data;
      }
      this.applyFilters();
      this.changeDetectorRef.detectChanges();
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      this.loading = false;
      this.changeDetectorRef.detectChanges();
    });
  }

  //---------------------------------------------------
  // FILTROS
  //---------------------------------------------------

  onSearch(value: string): void {
    this.searchText = value;
    this.applyFilters();

  }
  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index >= 0) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  onSortChange(event: Event): void {
    this.selectedSort = (event.target as HTMLSelectElement).value;
    this.applyFilters();
    this.changeDetectorRef.detectChanges();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategories = [];
    this.selectedSort = 'Relevancia';
    this.applyFilters();
    this.changeDetectorRef.detectChanges();
  }

  applyFilters(): void {
    let data = [...this.courses];
    //-------------------------
    // Buscar
    //-------------------------
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      data = data.filter(course =>
        course.title.toLowerCase().includes(search)
        ||
        course.description.toLowerCase().includes(search)
      );
    }
    //-------------------------
    // Categoría
    //-------------------------

    if (this.selectedCategories.length > 0) {
      data = data.filter(course =>
        this.selectedCategories.includes(course.categoryName)
      );
    }
    //-------------------------
    // Orden
    //-------------------------
    switch (this.selectedSort) {
      case 'Menor Precio':
        data.sort((a, b) => a.price - b.price);
        break;
      case 'Mayor Precio':
        data.sort((a, b) => b.price - a.price);
        break;
    }
    this.filteredCourses = data;
  }
  //--------------------------------------------------
  // NAVEGACIÓN
  //---------------------------------------------------
  goToCourse(course: CourseResponse): void {
    this.router.navigate([
      `/catalog/course/${course.idCourse}`
    ]);
  }

  //---------------------------------------------------
  // UTILIDADES
  //---------------------------------------------------

  calculatePrice(price: number): number {
    if (price <= 0) {
      return 0;
    }
    return +(price * 0.95).toFixed(2);
  }

  formatPrice(price: number): string {
    if (!price || price <= 0) {
      return 'Gratis';
    }
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(this.calculatePrice(price));
  }
}
