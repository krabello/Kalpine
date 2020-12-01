window.Kalpine = {
    directives: {
        "x-text": (element, value) => {
            element.innerText = value;
        },
        "x-show": (element, value) => {
            element.style.display = value ? 'block' : 'none'
        },
    },
    boot() {
        this.root = document.querySelector("[x-data]")
        this.data = this.observe(this.getInitialData())
        this.registerListeners()
        this.refreshDom()
    },
    registerListeners() {
        this.walkdom(this.root, (element) => {
          Array.from(element.attributes).forEach((attribute) => {
            if (!attribute.name.startsWith("@")) return;

            let event = attribute.name.replace("@", "");
            element.addEventListener(event, () => {
              eval(`with (this.data) { (${attribute.value}) }`);
            });
          });
        });
    },
    // reactivity core
    observe(data) {
        self = this
        return new Proxy(data, {
            set(target, key, value) {
                target[key] = value
                self.refreshDom();
            }
        })
    },
    refreshDom() {
        this.walkdom(this.root, (element) => {
            Array.from(element.attributes).forEach(attribute => {
                if (!Object.keys(this.directives).includes(attribute.name)) return
                this.directives[attribute.name](
                  element,
                  eval(`with (this.data) { (${attribute.value}) }`)
                );
            });
        })
    },
    // walk the dom tree recursively
    walkdom(element, callback) {
        callback(element)
        element = element.firstElementChild
        while (element) {
            this.walkdom(element, callback)
            element = element.nextElementSibling
        }
    },
    getInitialData() {
        let dataString = this.root.getAttribute("x-data");
        return eval(`(${dataString})`)
    }
}

window.Kalpine.boot();