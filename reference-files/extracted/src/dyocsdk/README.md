# DYOC SDK - Developer Guidelines

## CAUTION ⚠️
This sdk will be compiled and injected into the preview iframe. Therefore, **avoid importing unnecessary dependencies** that could increase the bundle size of the iframe. Larger bundle sizes can significantly impact the overall user experience, especially in the preview mode.

## TODOs 📝

1. **Manual Build Step Required**
    - After any file changes in this SDK, **run the following command manually** to rebuild the SDK:
      ```bash
      yarn run build:dyocsdk
      ```
    - We need to implement a **dev server** to automate this process in the future.

2. **SDK Distribution Strategy**
    - The SDK should be maintained in a **separate repository**.
    - It should be distributed via **CDN** for better accessibility and performance.
    - This task is being tracked under [SCAL-236523](https://thoughtspot.atlassian.net/browse/SCAL-236523).

## Additional Notes

- Keep an eye on bundle size optimizations.
- Ensure that the SDK can be easily accessed and integrated via CDN once it's ready.

