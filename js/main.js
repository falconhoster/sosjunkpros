(function() {
    'use strict';

    const APP = {
        init: function() {
            this.cacheElements();
            this.bindEvents();
            this.initLazyLoad();
            this.initVisitorCity();
        },

        cacheElements: function() {
            this.header = document.getElementById('header');
            this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
            this.mainNav = document.getElementById('mainNav');
            this.quoteForm = document.getElementById('quoteForm');
            this.faqItems = document.querySelectorAll('.faq-item');
            this.serviceCards = document.querySelectorAll('.service-card');
            this.lazyImages = document.querySelectorAll('img[loading="lazy"]');
            this.heroCity = document.getElementById('heroCity');
            this.contactCity = document.getElementById('contactCity');
        },

        bindEvents: function() {
            this.bindScrollEvents();
            this.bindMobileMenu();
            this.bindSmoothScroll();
            this.bindFAQ();
            this.bindForm();
            this.bindServiceCards();
        },

        bindScrollEvents: function() {
            let lastScroll = 0;
            let ticking = false;

            window.addEventListener('scroll', function() {
                if (!ticking) {
                    window.requestAnimationFrame(function() {
                        APP.handleScroll(lastScroll);
                        lastScroll = window.scrollY;
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        },

        handleScroll: function(lastScroll) {
            const currentScroll = window.scrollY;
            const headerHeight = this.header.offsetHeight;
            const scrollThreshold = 100;

            if (currentScroll > headerHeight) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                if (!this.header.classList.contains('hidden')) {
                    this.header.classList.add('hidden');
                }
            } else {
                this.header.classList.remove('hidden');
            }
        },

        bindMobileMenu: function() {
            if (!this.mobileMenuToggle) return;

            this.mobileMenuToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                this.setAttribute('aria-expanded', this.classList.contains('active'));
                
                if (this.classList.contains('active')) {
                    APP.mainNav.style.display = 'block';
                    APP.mainNav.style.position = 'absolute';
                    APP.mainNav.style.top = '100%';
                    APP.mainNav.style.left = '0';
                    APP.mainNav.style.right = '0';
                    APP.mainNav.style.backgroundColor = '#fff';
                    APP.mainNav.style.padding = '20px';
                    APP.mainNav.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    APP.mainNav.querySelector('ul').style.flexDirection = 'column';
                    APP.mainNav.querySelector('ul').style.gap = '16px';
                } else {
                    APP.mainNav.style.display = '';
                    APP.mainNav.style.position = '';
                    APP.mainNav.style.top = '';
                    APP.mainNav.style.left = '';
                    APP.mainNav.style.right = '';
                    APP.mainNav.style.backgroundColor = '';
                    APP.mainNav.style.padding = '';
                    APP.mainNav.style.boxShadow = '';
                }
            });
        },

        bindSmoothScroll: function() {
            document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    const target = document.querySelector(href);
                    if (!target) return;

                    e.preventDefault();
                    
                    const headerHeight = APP.header.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    if (APP.mobileMenuToggle && APP.mobileMenuToggle.classList.contains('active')) {
                        APP.mobileMenuToggle.classList.remove('active');
                        APP.mainNav.style.display = '';
                    }
                });
            });
        },

        bindFAQ: function() {
            this.faqItems.forEach(function(item) {
                const question = item.querySelector('.faq-question');
                
                question.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');
                    
                    document.querySelectorAll('.faq-item.active').forEach(function(activeItem) {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                        }
                    });

                    item.classList.toggle('active', !isActive);
                });
            });
        },

        bindForm: function() {
            if (!this.quoteForm) return;

            this.quoteForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries());

                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                console.log('Form submitted:', data);

                setTimeout(function() {
                    submitBtn.textContent = 'Quote Request Sent!';
                    submitBtn.style.backgroundColor = '#22C55E';
                    
                    APP.quoteForm.reset();

                    setTimeout(function() {
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                    }, 3000);
                }, 1500);
            });

            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                phoneInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) value = value.slice(0, 10);
                    
                    if (value.length >= 6) {
                        value = '(' + value.slice(0,3) + ') ' + value.slice(3,6) + '-' + value.slice(6);
                    } else if (value.length >= 3) {
                        value = '(' + value.slice(0,3) + ') ' + value.slice(3);
                    }
                    
                    e.target.value = value;
                });
            }
        },

        bindServiceCards: function() {
            this.serviceCards.forEach(function(card) {
                card.addEventListener('click', function(e) {
                    if (e.target.classList.contains('service-link')) return;
                    
                    const link = card.querySelector('.service-link');
                    if (link) {
                        const href = link.getAttribute('href');
                        if (href && href.startsWith('#')) {
                            e.preventDefault();
                            const target = document.querySelector(href);
                            if (target) {
                                const headerHeight = APP.header.offsetHeight;
                                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }
                });
            });
        },

        initLazyLoad: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            observer.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                });

                this.lazyImages.forEach(function(img) {
                    imageObserver.observe(img);
                });
            }
        },

        initVisitorCity: async function() {
            const city = this.getCachedVisitorCity() || await this.fetchVisitorCity();
            if (!city) return;

            if (this.heroCity) {
                this.heroCity.textContent = city;
            }

            if (this.contactCity) {
                this.contactCity.textContent = city;
            }
        },

        getCachedVisitorCity: function() {
            try {
                const cachedValue = window.localStorage.getItem('sosVisitorCity');
                const cachedTimestamp = window.localStorage.getItem('sosVisitorCityTimestamp');

                if (!cachedValue || !cachedTimestamp) {
                    return '';
                }

                const maxAge = 24 * 60 * 60 * 1000;
                const isFresh = Date.now() - Number(cachedTimestamp) < maxAge;

                return isFresh ? cachedValue : '';
            } catch (error) {
                return '';
            }
        },

        cacheVisitorCity: function(city) {
            try {
                window.localStorage.setItem('sosVisitorCity', city);
                window.localStorage.setItem('sosVisitorCityTimestamp', String(Date.now()));
            } catch (error) {
                // Ignore storage failures so location detection remains non-blocking.
            }
        },

        fetchVisitorCity: async function() {
            if (!window.fetch) return '';

            const providers = [
                {
                    url: 'https://ipwho.is/',
                    extractCity: function(data) {
                        return typeof data.city === 'string' ? data.city.trim() : '';
                    }
                },
                {
                    url: 'https://get.geojs.io/v1/ip/geo.json',
                    extractCity: function(data) {
                        return typeof data.city === 'string' ? data.city.trim() : '';
                    }
                }
            ];

            for (let i = 0; i < providers.length; i += 1) {
                const city = await this.fetchCityFromProvider(providers[i]);
                if (city) {
                    this.cacheVisitorCity(city);
                    return city;
                }
            }

            return '';
        },

        fetchCityFromProvider: async function(provider) {
            const controller = 'AbortController' in window ? new AbortController() : null;
            const timeoutId = window.setTimeout(function() {
                if (controller) {
                    controller.abort();
                }
            }, 2500);

            try {
                const response = await window.fetch(provider.url, {
                    headers: {
                        'Accept': 'application/json'
                    },
                    cache: 'no-store',
                    signal: controller ? controller.signal : undefined
                });

                if (!response.ok) {
                    return '';
                }

                const data = await response.json();
                return provider.extractCity(data);
            } catch (error) {
                return '';
            } finally {
                window.clearTimeout(timeoutId);
            }
        }
    };

    window.APP = APP;

    document.addEventListener('DOMContentLoaded', function() {
        APP.init();
    });

})();
