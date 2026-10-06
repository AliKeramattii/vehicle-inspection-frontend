# Application viewport

`AppViewport` bounds customer, operations and foundation shells to `100dvh` (100vh fallback).
The document does not scroll. Flex children use min-height:0; long content uses one named internal
scroll region. Customer screens use their main region only when content exceeds its available height;
the resize/mutation bridge observes the main and direct children to enable scrolling when necessary.
Fitting screens use clipping, avoiding an unnecessary compositing layer that changes Chromium text
rasterization and would invalidate earlier pixel baselines. Photography uses `.photo-scroll`, with
the journey header and bottom action outside it. The image carousel scrolls only horizontally.
Operations and the foundation gallery use `.app-scroll`/main, retaining access to long content.

Customer actions and navigation remain sticky inside their designated region when older forms
expand. Normal 390×844 earlier screens keep their existing spacing. No form/workflow/auth state
was changed. Relative containing blocks on the shell/main keep offscreen accessible input labels
inside their scroll region rather than extending the document after mobile autofocus.

Safe areas are applied at the shell top and existing bottom-action primitives. Root viewport metadata
requests `interactive-widget=resizes-content`. The narrow `ViewportResize` client bridge also
observes a keyboard-resized visual viewport and supplies the available height through a CSS variable.
It scrolls a focused field into its internal region, releases the override when restored, cleans up
listeners/animation frames and never constrains pinch zoom (scale other than 1).

Browser tests verify both body/document bounds, reachable actions, expanded terms/address/plate states,
long section scrolling, live camera/review and controls within the image at 360×800, 390×844 and
430×932. A 390×500 test exercises focus and internal scrolling in a keyboard-sized viewport.
Unit tests cover the visual viewport override, restoration, unmount cleanup and pinch-zoom exemption.
Physical phone keyboards/browser chrome still warrant device testing; browser emulation does not
reproduce every iOS/Android keyboard behavior.

Foundation gallery screenshots intentionally change from a whole scrolling document to a bounded
viewport with internal scrolling. Earlier customer baselines should stay unchanged unless a genuine
viewport regression is found and reviewed.
