const gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('serve', () => {
	browserSync.init({
		server: {
			baseDir: ['./']
		}
	});
	
	gulp.watch(['./*.html', './*.css', './*.js'], browserSync.reload);
});