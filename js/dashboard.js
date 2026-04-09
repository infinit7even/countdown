(function(DOM, OCA, OC) {
    document.addEventListener('DOMContentLoaded', () => {
        if (OCA.Dashboard && OCA.Dashboard.register) {
            OCA.Dashboard.register('countdown_widget', (el) => {
                const container = document.createElement('div');
                container.className = 'countdown-widget-container';
                container.innerHTML = '<div class="icon-loading-small" style="height: 50px; display: flex; justify-content: center; align-items: center;"></div>';
                el.appendChild(container);

                const timestamp = new Date().getTime();
                const url = OC.generateUrl('/apps/countdown/api/countdowns') + '?t=' + timestamp;
                
                fetch(url, {
                    credentials: 'same-origin',
                    headers: {
                        'requesttoken': OC.requestToken,
                        'Accept': 'application/json'
                    }
                })
                .then(res => {
                    if (!res.ok) throw new Error('API Response not ok');
                    return res.json();
                })
                .then(countdowns => {
                    container.innerHTML = '';
                    
                    if (!Array.isArray(countdowns)) {
                        throw new Error('Invalid data format');
                    }
                    
                    if (countdowns.length === 0) {
                        const empty = document.createElement('div');
                        empty.style.padding = '20px';
                        empty.style.textAlign = 'center';
                        empty.style.color = 'var(--color-text-maxcontrast)';
                        empty.textContent = 'No active countdowns.';
                        container.appendChild(empty);
                        return;
                    }

                    const list = document.createElement('ul');
                    list.style.listStyle = 'none';
                    list.style.padding = '0';
                    list.style.margin = '0';

                    const now = new Date().getTime();
                    
                    // Sort by targetDate
                    countdowns.sort((a,b) => (a.targetDate || 0) - (b.targetDate || 0));
                    
                    // Limit to 7 items as the backend did
                    const items = countdowns.slice(0, 7);

                    items.forEach(cd => {
                        const li = document.createElement('li');
                        li.style.borderBottom = '1px solid var(--color-border)';
                        if (cd === items[items.length - 1]) {
                            li.style.borderBottom = 'none';
                        }

                        let subtitle = 'Already expired!';
                        const targetDate = cd.targetDate || 0;
                        const distance = targetDate - now;
                        if (distance >= 0) {
                            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                            subtitle = days > 0 ? `Expires in ${days} days` : 'Expires today!';
                        }

                        const a = document.createElement('a');
                        a.href = OC.generateUrl('/apps/countdown/');
                        a.style.display = 'flex';
                        a.style.alignItems = 'center';
                        a.style.padding = '12px 10px';
                        a.style.textDecoration = 'none';
                        a.style.color = 'var(--color-main-text)';
                        a.style.transition = 'background-color 0.2s, transform 0.2s';
                        a.style.borderRadius = 'var(--border-radius-large, 8px)';
                        
                        a.onmouseover = () => {
                            a.style.backgroundColor = 'var(--color-background-hover)';
                        };
                        a.onmouseout = () => {
                            a.style.backgroundColor = 'transparent';
                        };

                        const icon = document.createElement('div');
                        const iconUrl = OC.imagePath('countdown', 'app-dark.svg');

                        // Use background-image + filter: var(--background-invert-if-dark)
                        // app-dark.svg is black → in dark mode invert(100%) makes it white, in light mode 'no' keeps it black.
                        // This is the standard Nextcloud pattern for theme-aware dashboard icons.
                        icon.style.backgroundImage = `url(${iconUrl})`;
                        icon.style.backgroundSize = '24px 24px';
                        icon.style.backgroundRepeat = 'no-repeat';
                        icon.style.backgroundPosition = 'center';
                        icon.style.filter = 'var(--background-invert-if-dark)';

                        icon.style.marginRight = '16px';
                        icon.style.opacity = '0.8';
                        icon.style.width = '32px';
                        icon.style.height = '32px';
                        icon.style.minWidth = '32px';
                        icon.style.display = 'flex';
                        icon.style.alignItems = 'center';
                        icon.style.justifyContent = 'center';

                        const textDiv = document.createElement('div');
                        textDiv.style.display = 'flex';
                        textDiv.style.flexDirection = 'column';
                        textDiv.style.overflow = 'hidden';

                        const title = document.createElement('strong');
                        title.textContent = cd.name || 'Unknown';
                        title.style.fontSize = '15px';
                        title.style.lineHeight = '1.3';
                        title.style.marginBottom = '4px';
                        title.style.whiteSpace = 'nowrap';
                        title.style.overflow = 'hidden';
                        title.style.textOverflow = 'ellipsis';

                        const subtitleEl = document.createElement('span');
                        subtitleEl.textContent = subtitle;
                        subtitleEl.style.fontSize = '12px';
                        subtitleEl.style.color = 'var(--color-text-maxcontrast)';

                        textDiv.appendChild(title);
                        textDiv.appendChild(subtitleEl);

                        a.appendChild(icon);
                        a.appendChild(textDiv);
                        li.appendChild(a);
                        list.appendChild(li);
                    });
                    container.appendChild(list);
                })
                .catch(err => {
                    console.error('Error loading countdown widget:', err);
                    container.innerHTML = '<div style="padding: 20px; color: var(--color-error); text-align: center;">Error loading widget data</div>';
                });
            });
        }
    });
})(document, window.OCA, window.OC);
