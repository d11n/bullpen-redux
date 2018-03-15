// eslint-disable-next-line max-params
(function main(BULLPEN, REDUX, Thin_promise) {
    class Collection extends BULLPEN.Collection {
        constructor(params) {
            params.store_creator
                = (store) => REDUX.createStore(do_action, store)
                ; // eslint-disable-line indent
            params.default_operation = perform_default_operation;
            return decorate_instance(super(params));
        }
    }
    return module.exports = Object.freeze(Collection);

    // -----------

    function decorate_instance(this_collection) {
        return this_collection;
    }

    // -----------

    function do_action(store, action) {
        if (!action || !action.type) {
            throw new Error('action must have a "type" property');
        } else if ('string' !== typeof action.type) {
            throw new TypeError('action.type must be a string');
        } else if ('@@redux/INIT' === action.type) { // ick
            return store;
        }
        return give_up(action);
    }

    function give_up(action) {
        throw new Error(
            `"${ action.type }" is not a BULLPEN.Collection action`,
            ); // eslint-disable-line indent
    }

    // -----------

    function perform_default_operation(operation, store, make_request) {
        const next_thing = new Thin_promise;
        if (operation.id) {
            const item = store.item_list.find((itm) => operation.id === itm.id);
            if (item) {
                next_thing.do(item);
            } else {
                make_request().then(update_item);
            }
        } else if (operation.query) {
            make_request().then(update_query_result);
        } else if (store.is_item_list_fully_hydrated) {
            next_thing.do(store.item_list);
        } else {
            make_request().then(update_items);
        }
        return next_thing;

        // -----------

        function update_item(item) {
            return next_thing.do(item);
        }

        function update_items(items) {
            return next_thing.do(store.item_list);
        }

        function update_query_result(query_result) {
            return next_thing.do(store.query_result_dict[query_result.name]);
        }
    }
}(
    require('bullpen'),
    require('redux'),
    require('bullpen/source/thin-promise'), // do something better than this
));
