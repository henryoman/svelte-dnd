export function droppable(options) {
    return (element) => {
        const unregister = options.controller.engine.registerDroppable({
            id: options.id,
            element,
            data: options.data
        });
        const unsubscribe = options.controller.subscribe((snapshot) => {
            element.dataset.dndOver = snapshot.hoveredDroppableId === options.id ? 'true' : 'false';
        });
        return () => {
            unregister();
            unsubscribe();
            delete element.dataset.dndOver;
        };
    };
}
