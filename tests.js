var should = require('chai').should();

var Product = require('./component');
var product;

before(function(){
    const INITIAL_DATA = '{"product":{"e9f48ec6-c056-4404-911a-a15e1f0f8196":{"name":"existing product","SKU":999,"$id":"e9f48ec6-c056-4404-911a-a15e1f0f8196","$created":1434580464913,"$type":"product"}}}';
    if(require('fs').existsSync('storage.json')) { require('fs').unlinkSync('storage.json'); }
    require('fs').writeFileSync('storage.json', INITIAL_DATA);
    product = new Product();
    product.init({persistence: 'file'});
});

after(function(){
    if(require('fs').existsSync('storage.json')) { require('fs').unlinkSync('storage.json'); }
});

describe('smoke tests', function(){
    it('should load existing products from file', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:find.response', function(result){
            result.should.not.have.property('error');
            result.length.should.equal(1);
            done();            
        });
        process.emit('product:find', {});
    });
    it('should not create a product without a name', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.have.property('error');
            result.error.should.have.property('message');
            result.error.message.should.equal('requires property "name"');
            done();
        });
        process.emit('product:clear', {});
        process.emit('product:create', {});
    });
    it('should not create a product without a SKU', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.have.property('error');
            result.error.should.have.property('message');
            result.error.message.should.equal('requires property "SKU"');
            done();
        });
        process.emit('product:clear', {});
        process.emit('product:create', {name:'test'});
    });
    it('should create valid products', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.not.have.property('error');
            result.should.have.property('product');
            result.product.should.have.property('name');
            result.product.name.should.equal('test');
            done();
        });
        process.emit('product:clear', {});
        process.emit('product:create', {name:'test', SKU:'1'});
    });
    it.skip('should find all products', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:find.response', function(result){
            result.should.not.have.property('error');
            result.length.should.equal(3);
            done();
        });
        process.once('product:clear.response', function(err){
            process.emit('product:create', {name:'alpha', SKU:'100'});
            process.emit('product:create', {name:'beta', SKU:'200'});
            process.emit('product:create', {name:'gamma', SKU:'300'});
            process.emit('product:find', {});
        });
        process.emit('product:clear', {});
    });
});
