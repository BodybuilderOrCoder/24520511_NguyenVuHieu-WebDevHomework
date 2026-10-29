# HW1 – Production Portfolio Audit

## M1 – Accessibility Audit

### Objective
Evaluate the accessibility of the portfolio website using Lighthouse and manual browser testing.

### Test Environment
- Browser: Google Chrome
- Development server: VS Code Live Server
- Mobile viewport: 375px
- Accessibility standard: WCAG 2.2 AA

### Results
- Lighthouse Accessibility Score: 100/100.
- Semantic landmarks: Header, Navigation, Main, and Footer are present.
- Heading hierarchy: One H1 followed by H2 section headings.
- Responsive layout: No obvious horizontal overflow at 375px.
- Keyboard navigation: Manually tested.
- Automated accessibility audit: No failures reported.

### Limitations
A Lighthouse score of 100 does not guarantee full WCAG 2.2 AA compliance. Additional manual checks may be necessary.

### Conclusion
The website passed the initial accessibility audit. Further keyboard and security testing will be conducted in subsequent milestones.

## M2 – Keyboard Navigation & Focus Trap Audit

### Test Results
- Tab navigation follows a logical order.
- Shift+Tab supports reverse navigation.
- All interactive elements can be activated using the keyboard.
- Focus indicators are visible.
- Skip-to-content navigation works.
- No unintended keyboard focus traps were detected.
- No modal or dialog is present, so modal focus trapping is not applicable.

### Conclusion
The website passed the manual keyboard navigation audit.

## M3 – Content Security Policy Audit

### Objective
Implement a restrictive Content Security Policy (CSP) to reduce the risk of unauthorized script execution.

### Implementation
- Added a CSP meta tag to `index.html`.
- Restricted JavaScript and CSS resources to the same origin.
- Avoided inline JavaScript event handlers.
- Used `textContent` for rendering project data.

### Verification
- Tested the website using Python HTTP Server on port 8000.
- Confirmed that the website loads without CSP violations in Chrome DevTools.
- Confirmed that the project cards render correctly.
- Identified an inline-script CSP violation when using VS Code Live Server.

### Conclusion
The CSP implementation passed the local HTTP server verification. A production deployment should enforce CSP through HTTP response headers.

---

## M4 – Lighthouse Performance Audit

### Objective
Evaluate and improve website performance, especially visual stability during asynchronous content loading.

### Initial Results
- Performance: 1000
- Accessibility: 100/100
- Best Practices: 100/100
- SEO: 90/100
- First Contentful Paint: 0.9 seconds
- Largest Contentful Paint: 0.9 seconds
- Total Blocking Time: 0 milliseconds
- Cumulative Layout Shift: 0.100
- Speed Index: 0.9 seconds

### Issue Identified
Lighthouse identified `#projects-content` as the source of a layout shift during asynchronous project rendering.

### Optimization
Added the following CSS rule to reserve space for project content:

```css
#projects-content {
    min-height: 380px;
}
```

### Final Result
- Lighthouse Performance: 100/100.
- No JavaScript errors were observed during the local HTTP server test.
- The optimization improved the measured performance score from 98 to 100.

### Conclusion
The website achieved the Lighthouse Performance target in the final test. Further verification across multiple devices and viewport sizes is recommended.