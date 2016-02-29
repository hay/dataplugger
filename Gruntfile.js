module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        browserify : {
            dist : {
                src : 'dataplugger.js',
                dest : 'dataplugger.browser.js'
            }
        },

        babel : {
            options : {
                presets : ['es2015']
            },
            dist : {
                files : {
                    'dataplugger.browser.js' : 'dataplugger.browser.js'
                }
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
        'babel',
        'uglify'
    ]);

    grunt.registerTask('default', ['build']);
};