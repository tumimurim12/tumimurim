/* TUMIMURIM — site script */

(function () {
  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        isOpen ? 'Close navigation menu' : 'Open navigation menu'
      );
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 0) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  loadBlogPosts();
})();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Global callback for JSONP - must be defined before the script loads
window.handleBlogFeed = function(data) {
  console.log('Blog feed data received:', data);
  const container = document.getElementById('blog-posts');
  if (!container) {
    console.error('Blog container not found');
    return;
  }

  try {
    const entries = data.feed?.entry || [];
    console.log('Number of entries:', entries.length);

    if (!entries.length) {
      container.innerHTML =
        '<div class="blog-loading"><p>No posts yet. Check back soon.</p></div>';
      return;
    }

    const postsHtml = entries
      .map((entry) => {
        const title = entry.title?.$t || 'Untitled';
        
        // Get the alternate link (blog post URL)
        const link = entry.link?.find((l) => l.rel === 'alternate')?.href || 
                     entry.link?.[0]?.href || '#';
        
        const published = entry.published?.$t;
        const date = published
          ? new Date(published).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '';
        
        const rawSummary = entry.summary?.$t || entry.content?.$t || '';
        const excerpt =
          rawSummary.replace(/<[^>]+>/g, '').trim().slice(0, 150) +
          (rawSummary.length > 150 ? '…' : '');

        return `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="post-card">
          <div class="post-card-title">${escapeHtml(title)}</div>
          <div class="post-card-date">${escapeHtml(date)}</div>
          <div class="post-card-excerpt">${escapeHtml(excerpt)}</div>
        </a>`;
      })
      .join('');
    
    container.innerHTML = postsHtml;
  } catch (error) {
    console.error('Blog feed error:', error);
    container.innerHTML =
      '<div class="blog-loading"><p>Could not load posts. <a href="https://wordwayjourney.blogspot.com/" target="_blank" rel="noopener noreferrer">Visit the blog →</a></p></div>';
  }
};

function loadBlogPosts() {
  const container = document.getElementById('blog-posts');
  if (!container) {
    console.error('Blog container element not found');
    return;
  }

  // Build the JSONP URL
  const blogUrl = 'https://wordwayjourney.blogspot.com';
  const feedUrl = new URL(blogUrl + '/feeds/posts/default');
  feedUrl.searchParams.append('alt', 'json-in-script');
  feedUrl.searchParams.append('callback', 'handleBlogFeed');
  feedUrl.searchParams.append('max-results', '3');

  console.log('Loading blog feed from:', feedUrl.toString());

  // Load JSONP script dynamically
  const script = document.createElement('script');
  script.src = feedUrl.toString();
  script.async = true;
  
  script.onerror = () => {
    console.error('Failed to load blog feed script');
    container.innerHTML =
      '<div class="blog-loading"><p>Could not load posts. <a href="https://wordwayjourney.blogspot.com/" target="_blank" rel="noopener noreferrer">Visit the blog →</a></p></div>';
  };

  script.onload = () => {
    console.log('Blog feed script loaded successfully');
  };

  document.head.appendChild(script);
}

function scrollCarousel() {
  const container = document.querySelector('.carousel-container');
  if (!container) return;
  container.scrollBy({ left: 320, behavior: 'smooth' });
}

function handleNewsletterSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  const messageEl = form
    .closest('.newsletter-form-col')
    ?.querySelector('.newsletter-message');
  const email = input?.value?.trim();

  if (!email) return;

  window.open('https://thummim-assefa.kit.com', '_blank', 'noopener,noreferrer');

  if (messageEl) {
    messageEl.textContent =
      'Thanks! Complete your signup on the newsletter page that just opened.';
  }

  form.reset();
}
