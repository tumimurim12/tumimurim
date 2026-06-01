// Fetch latest blog posts from Blogspot RSS feed
async function fetchBlogPosts() {
    try {
        const feedUrl = 'https://wordwayjourney.blogspot.com/feeds/posts/default?alt=json&max-results=3';
        const response = await fetch(feedUrl);
        const data = await response.json();

        if (data.feed && data.feed.entry) {
            const blogContainer = document.getElementById('blog-posts');
            blogContainer.innerHTML = '';

            data.feed.entry.forEach(entry => {
                const title = entry.title.$t;
                const summary = entry.summary ? entry.summary.$t.substring(0, 150) + '...' : 'No preview available';
                const link = entry.link.find(l => l.rel === 'alternate').href;
                const published = new Date(entry.published.$t).toLocaleDateString();

                const blogPost = document.createElement('a');
                blogPost.href = link;
                blogPost.target = '_blank';
                blogPost.rel = 'noopener noreferrer';
                blogPost.className = 'blog-link';

                const blogCard = document.createElement('div');
                blogCard.className = 'blog-card';

                const blogTitle = document.createElement('h4');
                blogTitle.className = 'blog-card-title';
                blogTitle.textContent = title;

                const blogSummary = document.createElement('p');
                blogSummary.className = 'blog-card-summary';
                blogSummary.textContent = summary.replace(/<[^>]*>/g, '');

                const blogMeta = document.createElement('div');
                blogMeta.className = 'blog-card-meta';

                const blogDate = document.createElement('span');
                blogDate.className = 'blog-card-date';
                blogDate.textContent = published;

                const blogRead = document.createElement('span');
                blogRead.className = 'blog-card-read';
                blogRead.textContent = 'Read →';

                blogMeta.appendChild(blogDate);
                blogMeta.appendChild(blogRead);
                blogCard.appendChild(blogTitle);
                blogCard.appendChild(blogSummary);
                blogCard.appendChild(blogMeta);
                blogPost.appendChild(blogCard);
                blogContainer.appendChild(blogPost);
            });
        }
    } catch (error) {
        console.error('Failed to load the blog feed', error);
        const blogContainer = document.getElementById('blog-posts');
        if (blogContainer) {
            blogContainer.innerHTML = `
                <div class="blog-error">
                    <p>Unable to load the latest posts right now.</p>
                    <a href="https://wordwayjourney.blogspot.com/" target="_blank" rel="noopener noreferrer">Visit blog →</a>
                </div>
            `;
        }
    }
}

function scrollCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    carousel.scrollBy({
        left: 320,
        behavior: 'smooth'
    });
}

async function handleNewsletterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const messageNode = document.querySelector('.newsletter-message');
    if (!messageNode || !submitButton) return;
    const emailInput = form.querySelector('input[name="email"]');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) {
        messageNode.textContent = 'Please enter a valid email.';
        return;
    }

    const endpoint = '/api/subscribe';

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    messageNode.textContent = '';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            messageNode.textContent = data.message || 'Thanks! Your email has been submitted.';
            form.reset();
        } else {
            messageNode.textContent = data.error || data.message || 'Something went wrong. Please try again.';
        }
    } catch (error) {
        messageNode.textContent = 'Network error. Please try again later.';
        console.error('Newsletter submit error:', error);
    }

    submitButton.disabled = false;
    submitButton.textContent = 'Subscribe';
}

// Fade in animation on load
window.addEventListener('load', () => {
    document.querySelectorAll('.hero-title, .hero-subtitle, .hero-image-wrapper').forEach(el => {
        el.style.opacity = '1';
    });
    fetchBlogPosts();
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        const navMenu = document.getElementById('nav-menu');
        if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
        }
    });
});

const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;
        const isOpen = navMenu.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
}
