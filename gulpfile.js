'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp
    .task('test', () => {
        return gulp.src('./test/*.test.js', {
                read: false
            })
            .pipe(mocha({
                reporter: 'spec',
                require: ['must/register'],
                timeout: 3000
            }))
            .once('error', (err) => {
                console.error(err);
                process.exit(1);
            })
            .once('end', () => {
                process.exit();
            });
    })
    .task('default', ['test']);
