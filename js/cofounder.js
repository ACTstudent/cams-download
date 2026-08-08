document.addEventListener('alpine:init', () => {
  Alpine.data('nav', () => ({
    active: 'whats',
    init() {
      const sections = document.querySelectorAll('section[id]')
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.active = entry.target.id
          }
        })
      }, { rootMargin: '-50% 0px -50% 0px' })
      sections.forEach(sec => observer.observe(sec))
    }
  }))
})
