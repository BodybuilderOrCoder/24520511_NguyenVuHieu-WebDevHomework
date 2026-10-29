# HW3 – Security and Functional Test Report

## 1. Test Environment

- Application: TechConnect 2026 Event Hub
- Technology: HTML5, CSS3, Vanilla JavaScript
- Testing tool: Chrome DevTools
- Local server: VS Code Live Server

## 2. Functional Test Cases

| Test ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC01 | Valid registration | Success message displayed | PASS |
| TC02 | Simulated server failure | Error message displayed | PASS |
| TC03 | Retry after failure | Registration succeeds | PASS |
| TC04 | Rapid repeated submissions | Duplicate submissions blocked | PASS |
| TC05 | XSS payload in name field | Payload displayed as plain text | PASS |
| TC06 | Empty required fields | Browser blocks submission | PASS |
| TC07 | Keyboard navigation | All controls keyboard accessible | PASS |
| TC08 | Mobile viewport at 375px | No horizontal overflow | PASS |
| TC09 | Browser Console | No uncaught JavaScript errors | PASS |

## 3. Security Measures

The registration form uses `textContent` instead of unsafe `innerHTML` when displaying user-provided data.

A submission-state guard prevents repeated submissions while an asynchronous request is in progress.

HTML5 form validation checks required fields and email format.

## 4. Limitations

Registration is simulated using a Promise and timeout. No backend service or database is connected.

Client-side protections do not replace server-side validation, rate limiting, or duplicate-submission controls.

## 5. Conclusion

The tested implementation satisfies the documented frontend functional and security checks.
