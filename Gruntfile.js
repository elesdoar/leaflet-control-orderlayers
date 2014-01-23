module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['src/leaflet.control.orderlayers.js'],
                }
            }
        },

		cssmin: {
			add_banner: {
				options: {
					banner:'/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
				},
				files: {
					'dist/css/<%= pkg.name %>.min.css':['src/css/*.css']
				}
			}
		},
		
		copy: {
			main: {
				expand: true,
				cwd: 'src/',
				src: '**',
				dest: 'dist/',
			},
		},

        jshint: {
            options: {
                jquery: true,
                smarttabs: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: false,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                unused: false,
                browser: true,
                globals: {
                    angular: true,
                    module: true,
                    L: true,
                }
            },
            source: {
                src: ['src/leaflet.control.orderlayers.js']
            },
            tests: {
                src: ['test/unit/*.js', 'test/e2e/*.js'],
            },
            grunt: {
                src: ['Gruntfile.js']
            }
        },
        connect: {
            options: {
                port: 8000,
                base: './'
            },
            server: {
                options: {
                    keepalive: true
                }
            },
            testserver: {}
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js',
                autoWatch: false,
                singleRun: true
            },
            e2e: {
                configFile: 'config/karma-e2e.conf.js'
            },
            background: {
                configFile: 'config/karma.conf.js',
                background: true,
                autoWatch: false,
                singleRun: false,
                browsers: ['PhantomJS']
            }
        },
        watch: {
            source: {
                files: ['src/leaflet.control.orderlayers.js', 'src/css/*.css', 'test/unit/*.js', 'test/e2e/*.js'],
                tasks: [ 'karma:background:run', 'jshint', 'copy', 'uglify', 'cssmin' ]
            },
            grunt: {
                files: ['Gruntfile.js'],
                tasks: ['jshint:grunt']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('test:e2e', ['connect:testserver', 'karma:e2e']);
    grunt.registerTask('test', ['karma:unit', 'test:e2e']);
    grunt.registerTask('release', ['copy', 'uglify', 'cssmin']);
    grunt.registerTask('server', ['connect:server']);
    grunt.registerTask('default', ['karma:background', 'watch']);
};
