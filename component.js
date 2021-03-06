module.exports = function(){
    var _ = require('underscore');
    var schemaValidator = require('jsonschema');
    var productSchema = require('bonsens-models').product;
    var dao = require('daoi');

    this.init = function(config) {
        var self = this;
        config = config || {};
        this.params = _.defaults(config||{}, defaults);

        var daoImpl;
        var flags = { verbose: !!this.params.verbose };
        if(this.params.persistence === 'memory') {
            daoImpl = dao.use(dao.MEMORY);
        } else if(this.params.persistence === 'file') {
            daoImpl = dao.use(dao.FILE);
            if(!!this.params.storage) {
                var fullStoragePath = ['data', this.params.storage].join(require('path').sep);
                daoImpl.config({ storage:fullStoragePath, verbose:this.params.verbose });
            }
        } else {
            daoImpl = dao.use(dao.MEMORY);
            process.emit('product:init.error', { error: { message: 'unrecognized persistence mechanism, defaulted to "memory"' } } );
        }
        dao.register('product');

        process.on('product:clear', function(pin){
            if(!!pin.verbose) console.log('clonq/revo-product: product:clear: ', pin);
            var pout = {};
            daoImpl
            .clear()
            .then(function(){
                process.emit('product:clear.response', { });
            })
            .catch(function(err){
                pout.error = { message: err.message };
                process.emit('product:clear.response', pout);
            })
        });
        process.on('product:create', function(pin){
            if(!!pin.verbose) console.log('clonq/revo-product: product:create: ', pin);
            var pout = {};
            var errors = validate(pin);
            if(errors.length == 0) {
                daoImpl
                .product
                .create(pin)
                .then(function(product){
                    process.emit('product:create.response', { product: product });
                })
                .catch(function(err){
                    pout.error = { message: err.message };
                    process.emit('product:create.response', pout);
                })
            } else {
                pout.error = { message: errors[0].message };
                process.emit('product:create.response', pout);
            }
        });        
        process.on('product:find', function(criteria){
            criteria = criteria || {};
            criteria.$type = 'product';
            daoImpl.product.find(criteria)
            .then(function(result){
                process.emit('product:find.response', result);
            })
            .catch(function(err){
                process.emit('product:find.error', err);
            })
        });
    }

    function validate(payload) {
        productSchema.required = ['name', 'SKU'];
        var schemaErrors = schemaValidator.validate(payload, productSchema).errors;
        if(schemaErrors.length > 0) return schemaErrors;
        var dataErrors = [];
        if(payload.name.length == 0) dataErrors.push({message:'name is mandatory'});
        if(payload.SKU.length == 0) dataErrors.push({message:'SKU is mandatory'});
        return dataErrors;
    }

}

var defaults = module.exports.defaults = {
    persistence: 'memory',
    models: {
        product: {
            supportedMethods: ['find'],
        }
    }
}
