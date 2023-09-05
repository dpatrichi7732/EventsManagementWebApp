export class ScrollHelper {
    /**
     * Scrolls to a specified element after a short delay of 100ms.
     * @param element The element to scroll to.
     */
    public static scrollToElementWithDelay(element) {
        setTimeout(() => {
            this.scrollToElement(element);
        }, 100);
    }

    /**
     * Scrolls to a specified element.
     * @param element The element to scroll to.
     */
    public static scrollToElement(element) {
            element.scrollIntoView();
            window.scrollBy(0, -60); // -60 because of the navbar.
    }
}
