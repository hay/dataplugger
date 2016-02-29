module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        browserify : {
            dist : {
                src : 'src/dataplugger.js',
                dest : 'dataplugger.browser.js'
            }
        },

        uglify : {
            dist : {
                files : {
                    'dataplugger.browser.min.js' : ['dataplugger.browser.js']
                }
            }
        },

        watch : {
            js : {
                files : 'src/**/*.js',
                tasks : ['build']
            }
        }
    });

    grunt.registerTask('build', [
        'browserify',
        // 'uglify'
    ]);

    grunt.registerTask('default', ['build']);
};