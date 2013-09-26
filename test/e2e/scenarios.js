'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Test the directive from the examples', function() {
    describe('Simple example test', function() {
        it('should load the leaflet map', function() {
            browser().navigateTo('/examples/simple-example.html');
            expect(element("div#map").css("width")).toEqual("300px");
            expect(element("div#map").css("height")).toEqual("180px");
        });
    });
});
