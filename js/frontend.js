/**
 * Frontend JavaScript for GeoLine Website
 * Loads and displays dynamic content from the API
 */

// CRITICAL: Setup contact form handler IMMEDIATELY to prevent old cached scripts from interfering
// This runs as soon as the script loads, before DOMContentLoaded
(function() {
    'use strict';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'contact.html') {
        // Try to setup form immediately (form might not exist yet)
        function trySetup() {
            const form = document.getElementById('contactForm');
            if (form) {
                setupContactForm();
            } else if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', trySetup);
            } else {
                setTimeout(trySetup, 100);
            }
        }
        trySetup();
    }
})();

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Load content based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        loadHomePageContent();
    } else if (currentPage === 'portfolio.html') {
        loadPortfolioContent();
    } else if (currentPage === 'service.html') {
        loadServicesPageContent();
    } else if (currentPage === 'contact.html') {
        loadContactPageContent();
    } else if (currentPage === 'team.html') {
        loadLicensesContent();
    }
});

/**
 * Load homepage content
 */
async function loadHomePageContent() {
    try {
        await Promise.all([
            loadCarousel(),
            loadServices(),
            loadBlogPosts(),
            loadStatistics(),
            loadAboutPreview(),
            loadFAQs()
        ]);
    } catch (error) {
        console.error('Error loading homepage content:', error);
    }
}

/**
 * Load carousel slides
 */
async function loadCarousel() {
    try {
        const slides = await frontendAPI.getCarouselSlides();
        if (slides.length === 0) return;

        const carouselContainer = document.getElementById('carousel');
        if (!carouselContainer) return;

        const indicators = carouselContainer.querySelector('.carousel-indicators');
        const inner = carouselContainer.querySelector('.carousel-inner');

        if (!indicators || !inner) return;

        // Clear existing content
        indicators.innerHTML = '';
        inner.innerHTML = '';

        // Build carousel
        slides.forEach((slide, index) => {
            const imageUrl = frontendAPI.getImageUrl(slide.image_path);
            
            // Indicator
            const indicator = document.createElement('li');
            indicator.setAttribute('data-target', '#carousel');
            indicator.setAttribute('data-slide-to', index);
            if (index === 0) indicator.classList.add('active');
            indicators.appendChild(indicator);

            // Slide
            const slideDiv = document.createElement('div');
            slideDiv.className = `carousel-item${index === 0 ? ' active' : ''}`;
            slideDiv.innerHTML = `
                <img src="${imageUrl}" alt="${slide.title}">
                <div class="carousel-caption">
                    ${slide.subtitle ? `<p class="animated fadeInRight">${slide.subtitle}</p>` : ''}
                    <h1 class="animated fadeInLeft">${slide.title}</h1>
                    ${slide.button_text && slide.button_link ? 
                        `<a class="btn animated fadeInUp" href="${slide.button_link}">${slide.button_text}</a>` : 
                        `<a class="btn animated fadeInUp" href="https://api.whatsapp.com/send/?phone=994554110454&text&type=phone_number&app_absent=0">Əlaqə</a>`
                    }
                </div>
            `;
            inner.appendChild(slideDiv);
        });

        // Reinitialize carousel if Bootstrap is available
        if (typeof $ !== 'undefined' && $.fn.carousel) {
            const $carousel = $('#carousel');
            
            // Dispose existing carousel if any
            if ($carousel.data('bs.carousel')) {
                $carousel.carousel('dispose');
            }
            
            // Initialize with 3 second interval and ensure it keeps cycling
            $carousel.carousel({
                interval: 3000,
                wrap: true,
                ride: 'carousel',
                pause: false  // Don't pause on hover
            });
            
            // Ensure it starts cycling
            setTimeout(() => {
                if ($carousel.data('bs.carousel')) {
                    $carousel.carousel('cycle');
                }
            }, 100);
            
            // Re-initialize if it stops (fix for stopping issue)
            $carousel.on('slid.bs.carousel', function() {
                // Ensure it continues cycling
                const carouselData = $carousel.data('bs.carousel');
                if (carouselData && !carouselData._interval) {
                    $carousel.carousel('cycle');
                }
            });
        }
    } catch (error) {
        console.error('Error loading carousel:', error);
    }
}

/**
 * Build service carousel HTML with images and/or video
 */
function buildServiceCarousel(service, images, hasVideo, videoSrc, videoUrl, isExternalVideoUrl, index) {
    const carouselId = `service-carousel-${index}`;
    const carouselItems = [];
    
    // Add images to carousel
    images.forEach((img, idx) => {
        carouselItems.push(`
            <div class="carousel-item ${idx === 0 && !hasVideo ? 'active' : ''}">
                <img src="${img}" alt="${service.title} - Image ${idx + 1}" class="service-img-preview">
            </div>
        `);
    });
    
    // Add video to carousel if exists
    if (hasVideo) {
        let videoItem = '';
        if (isExternalVideoUrl) {
            // YouTube/Vimeo iframe
            let autoplayUrl = videoSrc;
            const separator = videoSrc.includes('?') ? '&' : '?';
            if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be')) {
                const videoId = videoSrc.match(/[?&]v=([^&]+)/) || videoSrc.match(/youtu\.be\/([^?]+)/);
                const id = videoId ? videoId[1] : '';
                autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1&playlist=' + id + '&controls=0&modestbranding=1&rel=0';
            } else if (videoSrc.includes('vimeo.com')) {
                autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1';
            } else {
                autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1';
            }
            videoItem = `
                <div class="carousel-item ${images.length === 0 ? 'active' : ''}">
                    <iframe class="service-video-iframe" src="${autoplayUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%; height:100%; border:0;"></iframe>
                </div>
            `;
        } else {
            // Local video file
            videoItem = `
                <div class="carousel-item ${images.length === 0 ? 'active' : ''}">
                    <video class="service-video-player" muted loop playsinline webkit-playsinline autoplay preload="auto" style="width:100%; height:100%; object-fit:cover;">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        }
        carouselItems.push(videoItem);
    }
    
    return `
        <div id="${carouselId}" class="carousel slide service-image-carousel" data-ride="carousel" data-interval="3000" data-carousel-index="${index}">
            <div class="carousel-inner">${carouselItems.join('')}</div>
        </div>
    `;
}

/**
 * Load services
 */
async function loadServices() {
    try {
        const services = await frontendAPI.getServices();
        if (services.length === 0) return;

        const servicesContainer = document.querySelector('.service .row');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = '';
        
        // Track carousel indices for staggered playback
        let carouselIndices = [];

        services.forEach((service, index) => {
            // Handle default placeholder image gracefully
            let imageUrl = frontendAPI.getImageUrl(service.image_path);
            if (service.image_path === "services/default-placeholder.jpg") {
                // Use a fallback placeholder if default image doesn't exist
                imageUrl = "https://via.placeholder.com/400x300?text=Service";
            }
            const delay = (index + 1) * 0.1;
            const hasVideo = service.video_url && service.video_url.trim() !== '';
            
            // Check if service has multiple images (stored as JSON array or comma-separated string)
            let images = [imageUrl];
            if (service.images) {
                if (typeof service.images === 'string') {
                    try {
                        // Try to parse as JSON
                        const parsed = JSON.parse(service.images);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            images = parsed.map(img => frontendAPI.getImageUrl(img));
                        }
                    } catch (e) {
                        // If not JSON, try comma-separated
                        const split = service.images.split(',').map(s => s.trim()).filter(s => s);
                        if (split.length > 0) {
                            images = split.map(img => frontendAPI.getImageUrl(img));
                        }
                    }
                } else if (Array.isArray(service.images) && service.images.length > 0) {
                    images = service.images.map(img => frontendAPI.getImageUrl(img));
                }
            }
            
            const hasMultipleImages = images.length > 1;
            
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'col-lg-4 col-md-6 wow fadeInUp';
            serviceDiv.setAttribute('data-wow-delay', `${delay}s`);
            
            // Build video element for overlay and modal button
            let videoElement = '';
            let videoOverlay = '';
            let actionButton = '';
            if (hasVideo) {
                const videoSrc = service.video_url;
                const isExternalUrl = videoSrc.startsWith('http://') || videoSrc.startsWith('https://');
                
                if (isExternalUrl) {
                    // YouTube/Vimeo - use iframe
                    let autoplayUrl = videoSrc;
                    const separator = videoSrc.includes('?') ? '&' : '?';
                    if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be')) {
                        const videoId = videoSrc.match(/[?&]v=([^&]+)/) || videoSrc.match(/youtu\.be\/([^?]+)/);
                        const id = videoId ? videoId[1] : '';
                        autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1&playlist=' + id + '&controls=0&modestbranding=1&rel=0';
                    } else if (videoSrc.includes('vimeo.com')) {
                        autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1';
                    } else {
                        autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1';
                    }
                    videoElement = `<iframe class="service-video-iframe" src="${autoplayUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:2;"></iframe>`;
                } else {
                    // Local file - use video element
                    const videoUrl = frontendAPI.getImageUrl(videoSrc);
                    videoElement = `<video class="service-video-player" muted loop playsinline webkit-playsinline autoplay preload="auto" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:2;">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
                }
                
                // Add modal button for opening in modal
                videoOverlay = `<button type="button" class="btn-play service-video-btn" data-toggle="modal" data-target="#serviceVideoModal" data-video-src="${videoSrc}">
                    <span></span>
                </button>`;
                actionButton = `<button type="button" class="btn btn-play-text" data-toggle="modal" data-target="#serviceVideoModal" data-video-src="${videoSrc}">
                    <i class="fas fa-play"></i>
                </button>`;
            }
            
            // Build video source info for carousel
            let videoSrc = null;
            let videoUrl = null;
            let isExternalVideoUrl = false;
            if (hasVideo) {
                videoSrc = service.video_url;
                isExternalVideoUrl = videoSrc.startsWith('http://') || videoSrc.startsWith('https://');
                if (!isExternalVideoUrl) {
                    videoUrl = frontendAPI.getImageUrl(videoSrc);
                }
            }
            
            // Build action button - always show lightbox for images
            if (!actionButton) {
                if (hasMultipleImages) {
                    // Create lightbox gallery for all images
                    const galleryLinks = images.map((img, idx) => 
                        `<a href="${img}" data-lightbox="service-${index}" ${idx === 0 ? '' : 'style="display:none;"'}></a>`
                    ).join('');
                    actionButton = `<a class="btn" href="${images[0]}" data-lightbox="service-${index}">+</a>${galleryLinks}`;
                } else {
                    // Single image
                    actionButton = `<a class="btn" href="${imageUrl}" data-lightbox="service">+</a>`;
                }
            }
            
            // Build image display - carousel for multiple images/video, single image otherwise
            const hasCarousel = hasMultipleImages || hasVideo;
            let imageDisplay = '';
            let overlayContent = '';
            
            if (hasCarousel) {
                // Carousel with images and/or video
                imageDisplay = buildServiceCarousel(service, images, hasVideo, videoSrc, videoUrl, isExternalVideoUrl, index);
                carouselIndices.push(index); // Track for staggered playback
            } else {
                // Single image without carousel
                imageDisplay = `<img src="${imageUrl}" alt="${service.title}" class="service-img-preview">`;
                // Show description text in overlay if available
                overlayContent = service.description ? `<div class="service-overlay"><p>${service.description}</p></div>` : '';
            }
            
            serviceDiv.innerHTML = `
                <div class="service-item">
                    <div class="service-img">
                        ${imageDisplay}
                        ${overlayContent}
                    </div>
                    <div class="service-text">
                        <h3>${service.title}</h3>
                        ${actionButton}
                    </div>
                </div>
            `;
            servicesContainer.appendChild(serviceDiv);
            
            // Initialize carousel if it exists (always visible, like videos)
            if (hasCarousel) {
                const carouselId = `service-carousel-${index}`;
                
                // Function to initialize carousel
                const initCarousel = () => {
                    const carousel = document.querySelector(`#${carouselId}`);
                    if (!carousel) return;
                    
                    // Try jQuery/Bootstrap 4 first
                    if (typeof $ !== 'undefined' && $.fn.carousel) {
                        const $carousel = $(carousel);
                        
                        // Check if already initialized
                        if ($carousel.data('bs.carousel')) {
                            $carousel.carousel('dispose');
                        }
                        
                        // Initialize carousel
                        $carousel.carousel({
                            interval: 3000,
                            wrap: true,
                            ride: 'carousel'
                        });
                        
                        // Ensure it starts cycling
                        setTimeout(() => {
                            if ($carousel.data('bs.carousel')) {
                                $carousel.carousel('cycle');
                            }
                        }, 100);
                        
                        return true;
                    }
                    
                    // Fallback to Bootstrap 5
                    if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                        try {
                            const carouselInstance = new bootstrap.Carousel(carousel, {
                        interval: 3000,
                                wrap: true,
                        ride: 'carousel'
                    });
                            carouselInstance.cycle();
                            return true;
                        } catch (e) {
                            console.error('Bootstrap 5 carousel init error:', e);
                        }
                    }
                    
                    return false;
                };
                
                // Calculate staggered delay based on carousel index
                const carouselIndex = carouselIndices.indexOf(index);
                const staggeredDelay = carouselIndex * 1000; // 1 second delay between each carousel
                
                // Try to initialize immediately
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        setTimeout(initCarousel, 300 + staggeredDelay);
                    });
                } else {
                    setTimeout(initCarousel, 300 + staggeredDelay);
                }
            }
        });
        
        // Setup video modal handlers
        setupServiceVideoModal();
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

/**
 * Load blog posts
 */
async function loadBlogPosts() {
    try {
        const posts = await frontendAPI.getBlogPosts();
        if (posts.length === 0) return;

        const blogContainer = document.querySelector('.blog .row');
        if (!blogContainer) return;

        blogContainer.innerHTML = '';

        posts.slice(0, 3).forEach((post, index) => {
            const imageUrl = frontendAPI.getImageUrl(post.image_path);
            const delay = index === 0 ? '0.2s' : '';
            
            const postDiv = document.createElement('div');
            postDiv.className = 'col-lg-4 col-md-6 wow fadeInUp';
            if (delay) postDiv.setAttribute('data-wow-delay', delay);
            postDiv.innerHTML = `
                <div class="blog-item">
                    <div class="blog-img">
                        <img src="${imageUrl || 'img/blog-1.jpg'}" alt="${post.title}">
                    </div>
                    <div class="blog-title">
                        <h3>${post.title}</h3>
                        <a class="btn" href="">+</a>
                    </div>
                    <div class="blog-meta">
                        ${post.author ? `<p>By<a href="">${post.author}</a></p>` : ''}
                        ${post.category ? `<p>In<a href="">${post.category}</a></p>` : ''}
                    </div>
                    <div class="blog-text">
                        <p>${post.excerpt || post.content?.substring(0, 100) || ''}</p>
                    </div>
                </div>
            `;
            blogContainer.appendChild(postDiv);
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

/**
 * Load statistics
 */
async function loadStatistics() {
    try {
        const statistics = await frontendAPI.getStatistics();
        if (statistics.length === 0) return;

        const statsContainer = document.querySelector('.fact .counters');
        if (!statsContainer) return;

        const leftCol = statsContainer.querySelector('.fact-left .row');
        const rightCol = statsContainer.querySelector('.fact-right .row');
        
        if (!leftCol || !rightCol) return;

        leftCol.innerHTML = '';
        rightCol.innerHTML = '';

        statistics.forEach((stat, index) => {
            const col = index < 2 ? leftCol : rightCol;
            const colIndex = index < 2 ? index : index - 2;
            
            const statDiv = document.createElement('div');
            statDiv.className = 'col-6';
            statDiv.innerHTML = `
                <div class="fact-icon">
                    ${stat.icon ? `<i class="${stat.icon}"></i>` : '<i class="flaticon-worker"></i>'}
                </div>
                <div class="fact-text">
                    <h2 data-toggle="counter-up">${stat.value}</h2>
                    <p>${stat.label}</p>
                </div>
            `;
            col.appendChild(statDiv);
        });

        // Reinitialize counter if available
        if (typeof $ !== 'undefined' && $.fn.counterUp) {
            $('[data-toggle="counter-up"]').counterUp({
                delay: 10,
                time: 2000
            });
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

/**
 * Load about preview
 */
async function loadAboutPreview() {
    try {
        const about = await frontendAPI.getAboutContent();
        if (!about) return;

        const aboutSection = document.querySelector('.about');
        if (!aboutSection) return;

        const aboutText = aboutSection.querySelector('.about-text');
        if (aboutText) {
            const title = aboutSection.querySelector('.section-header h2');
            const subtitle = aboutSection.querySelector('.section-header p');
            
            if (title) title.textContent = about.title || title.textContent;
            if (subtitle) subtitle.textContent = about.subtitle || subtitle.textContent;
            
        }

        const aboutImg = aboutSection.querySelector('.about-img img');
        if (aboutImg && about.image_path) {
            aboutImg.src = frontendAPI.getImageUrl(about.image_path);
            aboutImg.alt = about.title || 'About Image';
        }
    } catch (error) {
        console.error('Error loading about preview:', error);
    }
}

/**
 * Load FAQs
 */
async function loadFAQs() {
    try {
        const faqs = await frontendAPI.getFAQs();
        if (faqs.length === 0) return;

        const faqsContainer = document.querySelector('.faqs');
        if (!faqsContainer) return;

        const leftAccordion = faqsContainer.querySelector('#accordion-1');
        const rightAccordion = faqsContainer.querySelector('#accordion-2');
        
        if (!leftAccordion || !rightAccordion) return;

        leftAccordion.innerHTML = '';
        rightAccordion.innerHTML = '';

        faqs.forEach((faq, index) => {
            const accordion = index < 5 ? leftAccordion : rightAccordion;
            const accordionIndex = index < 5 ? index : index - 5;
            const delay = (accordionIndex + 1) * 0.1;
            const direction = index < 5 ? 'Left' : 'Right';
            
            const card = document.createElement('div');
            card.className = `card wow fadeIn${direction}`;
            card.setAttribute('data-wow-delay', `${delay}s`);
            card.innerHTML = `
                <div class="card-header">
                    <a class="card-link collapsed" data-toggle="collapse" href="#collapseFAQ${index}">
                        ${faq.question}
                    </a>
                </div>
                <div id="collapseFAQ${index}" class="collapse" data-parent="#accordion-${index < 5 ? 1 : 2}">
                    <div class="card-body">
                        ${faq.answer}
                    </div>
                </div>
            `;
            accordion.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}

/**
 * Load portfolio content
 */
async function loadPortfolioContent() {
    try {
        const portfolioContainer = document.querySelector('.portfolio-container');
        if (!portfolioContainer) return;

        const projects = await frontendAPI.getPortfolioProjects();
        
        // If projects exist, replace hardcoded content with dynamic content
        if (projects.length > 0) {
            portfolioContainer.innerHTML = '';

            projects.forEach((project, index) => {
                const imageUrl = frontendAPI.getImageUrl(project.image_path);
                const delay = (index + 1) * 0.1;
                const statusClass = {
                    'completed': 'first',
                    'in_progress': 'second',
                    'future': 'third'
                }[project.status] || 'third';
                
                const projectDiv = document.createElement('div');
                projectDiv.className = `col-lg-4 col-md-6 col-sm-12 portfolio-item ${statusClass} wow fadeInUp`;
                projectDiv.setAttribute('data-wow-delay', `${delay}s`);
                projectDiv.innerHTML = `
                    <div class="portfolio-warp">
                        <div class="portfolio-img">
                            <img src="${imageUrl}" alt="${project.title}">
                        </div>
                        <div class="portfolio-text">
                            <h3>${project.title}</h3>
                            <a class="btn" href="${imageUrl}" data-lightbox="portfolio">+</a>
                        </div>
                    </div>
                `;
                portfolioContainer.appendChild(projectDiv);
            });
        }

        // Initialize isotope and filter handlers (works for both dynamic and hardcoded content)
        if (typeof $ !== 'undefined' && $.fn.isotope) {
            const $container = $('.portfolio-container');
            
            // Destroy existing isotope instance if it exists
            if ($container.data('isotope')) {
                $container.isotope('destroy');
            }
            
            // Initialize isotope
            $container.isotope({
                itemSelector: '.portfolio-item',
                layoutMode: 'fitRows'
            });
            
            // Rebind filter handlers (remove old handlers first to avoid duplicates)
            $('#portfolio-flters li').off('click.portfolio-filter').on('click.portfolio-filter', function () {
                $("#portfolio-flters li").removeClass('filter-active');
                $(this).addClass('filter-active');
                $container.isotope({filter: $(this).data('filter')});
            });
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        // Even if there's an error, try to initialize isotope on existing content
        if (typeof $ !== 'undefined' && $.fn.isotope) {
            const $container = $('.portfolio-container');
            if (!$container.data('isotope')) {
                $container.isotope({
                    itemSelector: '.portfolio-item',
                    layoutMode: 'fitRows'
                });
            }
        }
    }
}

/**
 * Load services page content
 */
async function loadServicesPageContent() {
    try {
        const services = await frontendAPI.getServices();
        if (services.length === 0) return;

        const servicesContainer = document.querySelector('.service .row');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = '';
        
        // Track carousel indices for staggered playback
        let carouselIndices = [];

        services.forEach((service, index) => {
            // Handle default placeholder image gracefully
            let imageUrl = frontendAPI.getImageUrl(service.image_path);
            if (service.image_path === "services/default-placeholder.jpg") {
                // Use a fallback placeholder if default image doesn't exist
                imageUrl = "https://via.placeholder.com/400x300?text=Service";
            }
            const delay = (index + 1) * 0.1;
            const hasVideo = service.video_url && service.video_url.trim() !== '';
            
            // Check if service has multiple images (stored as JSON array or comma-separated string)
            let images = [imageUrl];
            if (service.images) {
                if (typeof service.images === 'string') {
                    try {
                        // Try to parse as JSON
                        const parsed = JSON.parse(service.images);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            images = parsed.map(img => frontendAPI.getImageUrl(img));
                        }
                    } catch (e) {
                        // If not JSON, try comma-separated
                        const split = service.images.split(',').map(s => s.trim()).filter(s => s);
                        if (split.length > 0) {
                            images = split.map(img => frontendAPI.getImageUrl(img));
                        }
                    }
                } else if (Array.isArray(service.images) && service.images.length > 0) {
                    images = service.images.map(img => frontendAPI.getImageUrl(img));
                }
            }
            
            const hasMultipleImages = images.length > 1;
            
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'col-lg-4 col-md-6 wow fadeInUp';
            serviceDiv.setAttribute('data-wow-delay', `${delay}s`);
            
            // Build video element for overlay and modal button
            let videoElement = '';
            let videoOverlay = '';
            let actionButton = '';
            if (hasVideo) {
                const videoSrc = service.video_url;
                const isExternalUrl = videoSrc.startsWith('http://') || videoSrc.startsWith('https://');
                
                if (isExternalUrl) {
                    // YouTube/Vimeo - use iframe
                    let autoplayUrl = videoSrc;
                    const separator = videoSrc.includes('?') ? '&' : '?';
                    if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be')) {
                        const videoId = videoSrc.match(/[?&]v=([^&]+)/) || videoSrc.match(/youtu\.be\/([^?]+)/);
                        const id = videoId ? videoId[1] : '';
                        autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1&playlist=' + id + '&controls=0&modestbranding=1&rel=0';
                    } else if (videoSrc.includes('vimeo.com')) {
                        autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1';
                    } else {
                        autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&loop=1';
                    }
                    videoElement = `<iframe class="service-video-iframe" src="${autoplayUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:2;"></iframe>`;
                } else {
                    // Local file - use video element
                    const videoUrl = frontendAPI.getImageUrl(videoSrc);
                    videoElement = `<video class="service-video-player" muted loop playsinline webkit-playsinline autoplay preload="auto" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:2;">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
                }
                
                // Add modal button for opening in modal
                videoOverlay = `<button type="button" class="btn-play service-video-btn" data-toggle="modal" data-target="#serviceVideoModal" data-video-src="${videoSrc}">
                    <span></span>
                </button>`;
                actionButton = `<button type="button" class="btn btn-play-text" data-toggle="modal" data-target="#serviceVideoModal" data-video-src="${videoSrc}">
                    <i class="fas fa-play"></i>
                </button>`;
            }
            
            // Build video source info for carousel
            let videoSrc = null;
            let videoUrl = null;
            let isExternalVideoUrl = false;
            if (hasVideo) {
                videoSrc = service.video_url;
                isExternalVideoUrl = videoSrc.startsWith('http://') || videoSrc.startsWith('https://');
                if (!isExternalVideoUrl) {
                    videoUrl = frontendAPI.getImageUrl(videoSrc);
                }
            }
            
            // Build action button - always show lightbox for images
            if (!actionButton) {
                if (hasMultipleImages) {
                    // Create lightbox gallery for all images
                    const galleryLinks = images.map((img, idx) => 
                        `<a href="${img}" data-lightbox="service-${index}" ${idx === 0 ? '' : 'style="display:none;"'}></a>`
                    ).join('');
                    actionButton = `<a class="btn" href="${images[0]}" data-lightbox="service-${index}">+</a>${galleryLinks}`;
                } else {
                    // Single image
                    actionButton = `<a class="btn" href="${imageUrl}" data-lightbox="service">+</a>`;
                }
            }
            
            // Build image display - carousel for multiple images/video, single image otherwise
            const hasCarousel = hasMultipleImages || hasVideo;
            let imageDisplay = '';
            let overlayContent = '';
            
            if (hasCarousel) {
                // Carousel with images and/or video
                imageDisplay = buildServiceCarousel(service, images, hasVideo, videoSrc, videoUrl, isExternalVideoUrl, index);
                carouselIndices.push(index); // Track for staggered playback
            } else {
                // Single image without carousel
                imageDisplay = `<img src="${imageUrl}" alt="${service.title}" class="service-img-preview">`;
                // Show description text in overlay if available
                overlayContent = service.description ? `<div class="service-overlay"><p>${service.description}</p></div>` : '';
            }
            
            serviceDiv.innerHTML = `
                <div class="service-item">
                    <div class="service-img">
                        ${imageDisplay}
                        ${overlayContent}
                    </div>
                    <div class="service-text">
                        <h3>${service.title}</h3>
                        ${actionButton}
                    </div>
                </div>
            `;
            servicesContainer.appendChild(serviceDiv);
            
            // Initialize carousel if it exists (always visible, like videos)
            if (hasCarousel) {
                const carouselId = `service-carousel-${index}`;
                
                // Function to initialize carousel
                const initCarousel = () => {
                    const carousel = document.querySelector(`#${carouselId}`);
                    if (!carousel) return;
                    
                    // Try jQuery/Bootstrap 4 first
                    if (typeof $ !== 'undefined' && $.fn.carousel) {
                        const $carousel = $(carousel);
                        
                        // Check if already initialized
                        if ($carousel.data('bs.carousel')) {
                            $carousel.carousel('dispose');
                        }
                        
                        // Initialize carousel
                        $carousel.carousel({
                            interval: 3000,
                            wrap: true,
                            ride: 'carousel'
                        });
                        
                        // Ensure it starts cycling
                        setTimeout(() => {
                            if ($carousel.data('bs.carousel')) {
                                $carousel.carousel('cycle');
                            }
                        }, 100);
                        
                        return true;
                    }
                    
                    // Fallback to Bootstrap 5
                    if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                        try {
                            const carouselInstance = new bootstrap.Carousel(carousel, {
                        interval: 3000,
                                wrap: true,
                        ride: 'carousel'
                    });
                            carouselInstance.cycle();
                            return true;
                        } catch (e) {
                            console.error('Bootstrap 5 carousel init error:', e);
                        }
                    }
                    
                    return false;
                };
                
                // Calculate staggered delay based on carousel index
                const carouselIndex = carouselIndices.indexOf(index);
                const staggeredDelay = carouselIndex * 1000; // 1 second delay between each carousel
                
                // Try to initialize immediately
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        setTimeout(initCarousel, 300 + staggeredDelay);
                    });
                } else {
                    setTimeout(initCarousel, 300 + staggeredDelay);
                }
            }
        });
        
        // Setup video modal handlers
        setupServiceVideoModal();
    } catch (error) {
        console.error('Error loading services page:', error);
    }
}

/**
 * Setup service video modal handlers
 */
function setupServiceVideoModal() {
    // Handle video modal opening
    const videoModal = document.getElementById('serviceVideoModal');
    if (!videoModal) return;
    
    const videoIframe = document.getElementById('serviceVideoIframe');
    const videoPlayer = document.getElementById('serviceVideoPlayer');
    if (!videoIframe || !videoPlayer) return;
    
    // Remove any existing event handlers to prevent duplicates
    $(videoModal).off('shown.bs.modal.serviceVideo show.bs.modal.serviceVideo');
    
    // When modal starts showing, prepare video
    $(videoModal).on('show.bs.modal.serviceVideo', function (e) {
        const button = $(e.relatedTarget);
        const videoSrc = button.data('video-src') || button.attr('data-video-src');
        if (videoSrc && !videoSrc.startsWith('http://') && !videoSrc.startsWith('https://')) {
            // For local files, prepare video element early
            const videoUrl = frontendAPI.getImageUrl(videoSrc);
            videoPlayer.src = videoUrl;
            videoPlayer.muted = true;
            videoPlayer.autoplay = true;
            videoPlayer.playsInline = true;
        }
    });
    
    // When modal is fully shown, set video source and play
    $(videoModal).on('shown.bs.modal.serviceVideo', function (e) {
        const button = $(e.relatedTarget);
        const videoSrc = button.data('video-src') || button.attr('data-video-src');
        if (videoSrc) {
            // Check if it's a URL (YouTube/Vimeo) or local file path
            if (videoSrc.startsWith('http://') || videoSrc.startsWith('https://')) {
                // External URL - use iframe
                videoIframe.style.display = 'block';
                videoPlayer.style.display = 'none';
                const separator = videoSrc.includes('?') ? '&' : '?';
                // Ensure autoplay parameters are correct
                let autoplayUrl = videoSrc;
                if (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be')) {
                    // YouTube URL - ensure proper format
                    autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1&modestbranding=1&showinfo=0&rel=0&enablejsapi=1';
                } else if (videoSrc.includes('vimeo.com')) {
                    // Vimeo URL
                    autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1';
                } else {
                    autoplayUrl = videoSrc + separator + 'autoplay=1&muted=1';
                }
                videoIframe.src = autoplayUrl;
            } else {
                // Local file - use video element
                videoIframe.style.display = 'none';
                
                // Make video visible and properly sized
                videoPlayer.style.display = 'block';
                videoPlayer.style.width = '100%';
                videoPlayer.style.height = '100%';
                videoPlayer.style.objectFit = 'contain';
                
                const videoUrl = frontendAPI.getImageUrl(videoSrc);
                
                // Set video source and attributes for autoplay
                videoPlayer.src = videoUrl;
                videoPlayer.muted = true; // Required for autoplay
                videoPlayer.autoplay = true;
                videoPlayer.loop = true; // Loop continuously
                videoPlayer.playsInline = true;
                videoPlayer.setAttribute('playsinline', 'true');
                videoPlayer.setAttribute('webkit-playsinline', 'true');
                videoPlayer.setAttribute('loop', 'true');
                
                // Load the video
                videoPlayer.load();
                
                // Function to attempt playing the video
                const tryPlay = () => {
                    // Ensure video is muted (required for autoplay)
                    videoPlayer.muted = true;
                    
                    // Ensure video is visible
                    if (videoPlayer.style.display === 'none') {
                        videoPlayer.style.display = 'block';
                    }
                    
                    // Check if video element is actually in the DOM and visible
                    const rect = videoPlayer.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        // Video container not sized yet, wait a bit
                        setTimeout(tryPlay, 100);
                        return;
                    }
                    
                    // Ensure loop is enabled for continuous playback
                    videoPlayer.loop = true;
                    
                    // Try to play immediately
                    const playPromise = videoPlayer.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log('Video autoplay started successfully');
                            // Ensure it keeps playing and looping
                            if (videoPlayer.paused) {
                                videoPlayer.play();
                            }
                            // Set up loop event listener to ensure continuous playback
                            videoPlayer.addEventListener('ended', function() {
                                videoPlayer.currentTime = 0;
                                videoPlayer.play();
                            }, { once: false });
                        }).catch(error => {
                            console.log('Autoplay prevented:', error);
                            // Retry after a short delay
                            setTimeout(() => {
                                videoPlayer.muted = true;
                                videoPlayer.loop = true;
                                videoPlayer.play().catch(e => {
                                    console.log('Retry autoplay failed:', e);
                                });
                            }, 300);
                        });
                    } else {
                        // Fallback for older browsers
                        videoPlayer.loop = true;
                        videoPlayer.play();
                    }
                };
                
                // Wait for video to be ready, then play
                const playWhenReady = () => {
                    // Video is ready, try to play
                    setTimeout(tryPlay, 50);
                };
                
                // Try playing immediately
                tryPlay();
                
                // Also try when video events fire
                videoPlayer.addEventListener('loadedmetadata', playWhenReady, { once: true });
                videoPlayer.addEventListener('loadeddata', playWhenReady, { once: true });
                videoPlayer.addEventListener('canplay', playWhenReady, { once: true });
                videoPlayer.addEventListener('canplaythrough', playWhenReady, { once: true });
                
                // Multiple fallback attempts to ensure it plays
                setTimeout(tryPlay, 100);
                setTimeout(tryPlay, 300);
                setTimeout(tryPlay, 500);
                setTimeout(tryPlay, 700);
            }
        }
    });
    
    // When modal is hidden, clear video source to stop playback
    $(videoModal).on('hide.bs.modal', function (e) {
        videoIframe.src = '';
        videoPlayer.src = '';
        videoPlayer.pause();
    });
    
    // Handle click on play buttons (both overlay and text area buttons)
    document.querySelectorAll('.service-item .service-video-btn, .service-item .btn-play-text').forEach(button => {
        button.addEventListener('click', function(e) {
            const videoSrc = this.getAttribute('data-video-src');
            if (videoSrc) {
                // Store video source for Bootstrap modal handler
                $(this).data('video-src', videoSrc);
            }
        });
    });
}

/**
 * Load contact page content
 */
async function loadContactPageContent() {
    try {
        const contactInfo = await frontendAPI.getContactInfo();
        if (contactInfo.length > 0) {
        const contactContainer = document.querySelector('.contact-info');
            if (contactContainer) {
        contactContainer.innerHTML = '';

        contactInfo.forEach(info => {
            const iconMap = {
                'phone': 'flaticon-call',
                'email': 'flaticon-send-mail',
                'address': 'flaticon-address',
                'hours': 'flaticon-calendar',
                'whatsapp': 'flaticon-call'
            };

            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.innerHTML = `
                <i class="${info.icon || iconMap[info.type] || 'flaticon-address'}"></i>
                <div class="contact-text">
                    <h2>${info.label}</h2>
                    <p>${info.value}</p>
                </div>
            `;
            contactContainer.appendChild(contactItem);
        });
            }
        }
    } catch (error) {
        console.error('Error loading contact page:', error);
    } finally {
        // Always setup contact form, regardless of contact info loading
        setupContactForm();
    }
}

/**
 * Setup contact form submission
 */
function setupContactForm() {
    console.log('Setting up contact form...');
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.log('Contact form not found, retrying...');
        // Form not found yet, try again after a short delay
        setTimeout(setupContactForm, 100);
        return;
    }

    console.log('Contact form found!');

    // Prevent duplicate event listeners
    if (contactForm.dataset.listenerAttached === 'true') {
        console.log('Form handler already attached, skipping...');
        return;
    }
    contactForm.dataset.listenerAttached = 'true';

    // Remove novalidate attribute to use HTML5 validation
    contactForm.removeAttribute('novalidate');

    // CRITICAL: Remove any existing jqBootstrapValidation handlers
    // This prevents the old PHP-based script from interfering
    if (typeof $ !== 'undefined') {
        console.log('Removing old jQuery handlers...');
        // Unbind ALL events from form and inputs to prevent old script interference
        $('#contactForm').off();
        $('#contactForm input, #contactForm textarea').off();
        $('#contactForm button').off();
        
        // Try to destroy jqBootstrapValidation if it exists
        if ($.fn.jqBootstrapValidation) {
            try {
                $('#contactForm input, #contactForm textarea').jqBootstrapValidation('destroy');
                console.log('Destroyed jqBootstrapValidation');
            } catch (e) {
                console.log('jqBootstrapValidation destroy failed (not initialized):', e);
            }
        }
        
        // Prevent old contact.js from running by removing its event handlers
        $(document).off('submit', '#contactForm');
    }

    // Use capture phase to ensure our handler runs first
    contactForm.addEventListener('submit', async (e) => {
        console.log('Form submit event triggered!');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Get fresh references to elements
        const successDiv = document.getElementById('success');
        const submitButton = document.getElementById('sendMessageButton');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        
        // Clear previous messages
        if (successDiv) {
            successDiv.innerHTML = '';
        }

        // Get form values
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const subject = subjectInput ? subjectInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        // Basic validation
        if (!name || !email || !subject || !message) {
            showFormMessage('Zəhmət olmasa bütün sahələri doldurun.', 'danger');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.', 'danger');
            return;
        }

        // Disable submit button
        const originalButtonText = submitButton ? submitButton.textContent : 'Mesaj Göndər';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Göndərilir...';
        }
        
        const formData = {
            name: name,
            email: email,
            subject: subject,
            message: message
        };

        // Check if API client is available
        if (typeof frontendAPI === 'undefined') {
            console.error('API client not available!');
            showFormMessage('Xidmət hazır deyil. Zəhmət olmasa səhifəni yeniləyin.', 'danger');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
            return;
        }

        try {
            console.log('Submitting form data:', formData);
            console.log('API client available:', typeof frontendAPI);
            const result = await frontendAPI.submitContactForm(formData);
            console.log('Form submitted successfully:', result);
            showFormMessage('Mesajınız uğurla göndərildi! Tezliklə sizinlə əlaqə saxlayacağıq.', 'success');
            contactForm.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            let errorMessage = 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.toString) {
                errorMessage = error.toString();
            }
            // Check for network errors
            if (error.message && error.message.includes('Failed to fetch')) {
                errorMessage = 'Backend server ilə əlaqə qurula bilmədi. Zəhmət olmasa backend serverin işlədiyini yoxlayın.';
            }
            console.error('Error details:', errorMessage);
            showFormMessage(errorMessage, 'danger');
        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });

    /**
     * Show form message
     */
    function showFormMessage(message, type) {
        const successDiv = document.getElementById('success');
        if (!successDiv) return;
        
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        successDiv.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <strong>${type === 'success' ? 'Uğurlu!' : 'Xəta!'}</strong> ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = successDiv.querySelector('.alert');
            if (alert && typeof $ !== 'undefined' && $.fn.fadeOut) {
                $(alert).fadeOut(() => {
                    successDiv.innerHTML = '';
                });
            } else if (alert) {
                alert.style.display = 'none';
                successDiv.innerHTML = '';
            }
        }, 5000);
    }
}

/**
 * Load licenses content
 */
async function loadLicensesContent() {
    try {
        const licenses = await frontendAPI.getLicenses();
        if (licenses.length === 0) return;

        const licensesContainer = document.querySelector('.team .row');
        if (!licensesContainer) return;

        licensesContainer.innerHTML = '';

        licenses.forEach((license, index) => {
            const imageUrl = frontendAPI.getImageUrl(license.image_path);
            const delay = (index + 1) * 0.1;
            
            const licenseDiv = document.createElement('div');
            licenseDiv.className = 'col-lg-6 col-md-6 wow fadeInUp';
            licenseDiv.setAttribute('data-wow-delay', `${delay}s`);
            licenseDiv.innerHTML = `
                <div class="team-item license-frame">
                    <div class="team-img">
                        <img src="${imageUrl}" alt="${license.title}">
                    </div>
                </div>
            `;
            licensesContainer.appendChild(licenseDiv);
        });
    } catch (error) {
        console.error('Error loading licenses:', error);
    }
}

