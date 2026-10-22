import Observer from "@cocreate/observer";
import { queryElements } from "@cocreate/utils";

const initializedElements = new WeakSet();

const CoCreateSearch = {
    init: function (container) {
        const mainContainer = container || document;

        if (!mainContainer.querySelectorAll) {
            return;
        }

        let search_elements = Array.from(mainContainer.querySelectorAll("[search-query]"));
        if (mainContainer.matches?.("[search-query]")) search_elements.unshift(mainContainer);
        const self = this;
        search_elements.forEach((element) => {
            self.searchEvent(element);
        });
    },

    searchEvent: function (element) {
        if (initializedElements.has(element)) return;
        initializedElements.add(element);
        const self = this;
        element.addEventListener("input", function () {
            self.runSearchOfElement(element, this.value);
        });
    },

    runSearchOfElement: function (searchElement, value) {
        const search_id = searchElement.getAttribute("search_id");
        const item_selector = searchElement.attributes.getNamedItem("search-query")?.value;

        if (!item_selector) {
            return;
        }

        const items = item_selector.trimStart().startsWith("$")
            ? queryElements({
                element: searchElement,
                selector: item_selector.endsWith("[]") ? item_selector : item_selector + "[]"
            })
            : document.querySelectorAll(search_id
                ? `[search_id='${search_id}'] ${item_selector}`
                : item_selector);

        const caseSensitive = searchElement.getAttribute("search-case-sensitive") === "true";
        const query = caseSensitive ? value : value.toLowerCase();
        items.forEach((item) => {
            const text = item.textContent || "";
            const matches = (caseSensitive ? text : text.toLowerCase()).includes(query);
            item.hidden = !matches;
            item.classList.toggle("hidden", !matches);
        });
    }
};

CoCreateSearch.init();
Observer.init({
    name: "search",
    types: ["addedNodes"],
    selector: "[search-query]",
    callback: mutation => CoCreateSearch.init(mutation.target)
});

export default CoCreateSearch;
