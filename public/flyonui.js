// FlyonUI JavaScript initialization
// This will be replaced by the actual FlyonUI JS when installed
console.log('FlyonUI components loaded');

// Initialize any FlyonUI components that need manual initialization
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality for buttons with data-set-theme
  const themeButtons = document.querySelectorAll('button[data-set-theme]');
  themeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const theme = this.getAttribute('data-set-theme');
      document.documentElement.setAttribute('data-theme', theme);
      console.log('Theme changed to:', theme);
      
      // Close dropdown after selection
      const dropdown = this.closest('.dropdown');
      if (dropdown) {
        const toggle = dropdown.querySelector('[tabindex="0"]');
        if (toggle) toggle.blur();
      }
    });
  });

  // Legacy theme toggle functionality for input elements (if any)
  const themeInputs = document.querySelectorAll('input[name="theme"]');
  themeInputs.forEach(input => {
    input.addEventListener('change', function() {
      document.documentElement.setAttribute('data-theme', this.value);
    });
  });
  
  // Tab functionality
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('tab-active'));
      // Add active class to clicked tab
      this.classList.add('tab-active');
      
      // Hide all tab panels
      const panels = document.querySelectorAll('.tab-panel');
      panels.forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('block');
      });
      
      // Show target panel
      const targetId = this.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
        targetPanel.classList.add('block');
      }
    });
  });

  // Improved dropdown functionality
  document.addEventListener('click', function(event) {
    const dropdownToggle = event.target.closest('[tabindex="0"][role="button"]');
    
    if (dropdownToggle) {
      event.preventDefault();
      const dropdown = dropdownToggle.closest('.dropdown');
      if (dropdown) {
        const content = dropdown.querySelector('.dropdown-content');
        if (content) {
          // Close all other dropdowns first
          document.querySelectorAll('.dropdown-content').forEach(otherContent => {
            if (otherContent !== content) {
              otherContent.classList.add('hidden');
              otherContent.parentElement.classList.remove('dropdown-open');
            }
          });
          
          // Toggle current dropdown
          const isHidden = content.classList.contains('hidden');
          if (isHidden) {
            content.classList.remove('hidden');
            dropdown.classList.add('dropdown-open');
          } else {
            content.classList.add('hidden');
            dropdown.classList.remove('dropdown-open');
          }
        }
      }
      return;
    }
    
    // Close dropdowns when clicking outside
    if (!event.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.add('hidden');
        if (content.parentElement) {
          content.parentElement.classList.remove('dropdown-open');
        }
      });
    }
  });
  
  // Handle escape key to close dropdowns
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.add('hidden');
        if (content.parentElement) {
          content.parentElement.classList.remove('dropdown-open');
        }
      });
    }
  });
  
  // Initialize dropdowns as closed
  document.querySelectorAll('.dropdown-content').forEach(content => {
    content.classList.add('hidden');
  });
}); 