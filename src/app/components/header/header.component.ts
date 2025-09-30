import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for [ngClass]

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Property to control if the mobile menu is open or closed.
  isMenuOpen = false;

  // Properties to control hiding the header on scroll.
  isHeaderHidden = false;
  private lastScrollTop = 0;
  private scrollThreshold = 10; // Prevents triggering on very small scrolls

  // Opens or closes the menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Closes the menu (useful for mobile menu links)
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // Listens to the scroll event on the entire page
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // If the scroll is very small, do nothing
    if (Math.abs(scrollTop - this.lastScrollTop) <= this.scrollThreshold) {
      return;
    }

    // Hide if scrolling down and far from the top
    if (scrollTop > this.lastScrollTop && scrollTop > 80) { // 80 is the header height
      this.isHeaderHidden = true;
    } else {
      // Show if scrolling up
      this.isHeaderHidden = false;
    }
    
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}

