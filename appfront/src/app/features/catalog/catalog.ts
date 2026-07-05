import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeaderCatalog } from "../../layout/componet-principal/header-catalog/header-catalog";
import { CourseModal } from "../../layout/componet-principal/course-modal/course-modal";
import { CourseResponse } from '../../models/course.model';
import { Api } from '../../api/api';
import { apidetailsCourse, apigetallCategory, apigetallCourse } from '../../api/functions';
import { CommonModule } from '@angular/common';
import { CategoryResponse } from '../../models/category.model';

@Component({
  selector: 'app-catalog',
  imports: [HeaderCatalog, CourseModal, CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private cdr = inject(ChangeDetectorRef);

  searchText: string = "";
  categories: CategoryResponse[] = [];
  courseList: CourseResponse[] = [];
  selectedCourse: CourseResponse | null = null;
  modalVisible: boolean = false;
  selectedCourseId: string = ""
  selectedCategories: string[] = [];
  selectedSortOption: string = 'Relevancia';


  constructor(private api: Api) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadCourses();
  }

  loadCategories() {
    this.api.invoke(apigetallCategory).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;
      if (Array.isArray(apiResponseData)) {
        this.categories = apiResponseData;
      } else if (apiResponseData && Array.isArray(apiResponseData.data)) {
        this.categories = apiResponseData.data;
      }
      this.cdr.detectChanges();
    }).catch((error) => {
      console.error(error);
    });
  }

  loadCourses() {
    this.api.invoke(apigetallCourse).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;
      if (Array.isArray(apiResponseData)) {
        this.courseList = apiResponseData;
      } else if (apiResponseData && Array.isArray(apiResponseData.data)) {
        this.courseList = apiResponseData.data;
      }
      this.cdr.detectChanges();
    }).catch((error) => {
      console.error(error);
    });
  }

  get filteredCourses(): CourseResponse[] {
    let filtered = [...this.courseList];

    // Filter by search text
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(search) ||
        course.description?.toLowerCase().includes(search)
      );
    }

    // Filter by selected categories
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(course =>
        this.selectedCategories.includes(course.categoryName)
      );
    }

    // Sort
    if (this.selectedSortOption === 'Menor Precio') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.selectedSortOption === 'Mayor Precio') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return '<i class="pi pi-star-fill"></i>'.repeat(fullStars) +
      (halfStar ? '<i class="pi pi-star-half-fill"></i>' : '') +
      '<i class="pi pi-star"></i>'.repeat(emptyStars);
  }

  onSearch(text: string) {
    this.searchText = text;
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  optionSelected = [
    'Relevancia',
    'Menor Precio',
    'Mayor Precio',
    'Mejor Valorados'
  ]
  onSortChange(event: Event) {
    const option = (event.target as HTMLSelectElement).value;
    this.optionSelectedChange(option);
  }

  optionSelectedChange(option: string) {
    this.selectedSortOption = option;
    this.applyFilters();
  }
  applyFilters() {

  }

  openModal(course: CourseResponse) {
    this.selectedCourse = course;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedCourse = null;
  }
  onCourseClick(course: CourseResponse) {
    this.selectedCourseId = course.idCourse;
    this.selectedCourse = course;
    this.modalVisible = true;
  }
  buyCourse(event: any) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    this.closeModal();
  }
  clearFilters() {
    this.selectedCategories = [];
    this.applyFilters();
  }

  openCourseDetail(idcourse: string) {
    this.api.invoke(apidetailsCourse, { idCourse: idcourse }).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;
      this.selectedCourse = apiResponseData.data || apiResponseData;
      this.modalVisible = true;
    })
  }
  applyDiscount(price: number): number {
    return price * 0.95;
  }

}
