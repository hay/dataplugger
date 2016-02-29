module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        bump : {
            options : {
                files : ['package.json', 'bower.json'],
                pushTo : 'origin',
                commitFiles : ['-a']
            }
        },

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

    grunt.registerTask('release', [
        'build',
        'bump:minor'
    ]);

    grunt.registerTask('default', ['build']);
};