import gulp from "gulp";
import autoprefixer from "autoprefixer";
import browsersync from "browser-sync";
import cssnano from "cssnano";
import del from "del";
import htmlmin from "gulp-htmlmin";
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
import plumber from "gulp-plumber";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import sass from "gulp-sass";
import sassGlob from "gulp-sass-glob";
import sourcemaps from "gulp-sourcemaps";

browsersync.create();

// project
const project = { root: __dirname };
project.dist = `${project.root}/docs`;

project.assets = `${project.root}/src`;
project.img = `${project.assets}/img`;
project.scss = `${project.assets}/scss`;
project.fonts = `${project.assets}/fonts`;
project.favicon = `${project.assets}/favicon`;

// BrowserSync
function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: `${project.dist}/`
		},
		port: 3000
	});
	done();
}

// Clean assets
function clean() {
	return del([`${project.dist}`]);
}

// Copy Favicon Assets
function favicon() {
	return gulp.src(`${project.favicon}/**/*`).pipe(gulp.dest(`${project.dist}`));
}

// Minify HTML
function html() {
	return gulp
		.src(`${project.assets}/index.html`)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest(`${project.dist}`));
}

// Copy Fonts Assets
function fonts() {
	return gulp
		.src(`${project.fonts}/**/*`)
		.pipe(gulp.dest(`${project.dist}/fonts/`));
}

// Optimize Images
function images() {
	return gulp
		.src(`${project.img}/**/*`)
		.pipe(newer(`${project.dist}/img/`))
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.jpegtran({ progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [
						{
							removeViewBox: false,
							collapseGroups: true
						}
					]
				})
			])
		)
		.pipe(gulp.dest(`${project.dist}/img/`));
}

// CSS task
function css() {
	return gulp
		.src(`${project.scss}/**/*.scss`)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sassGlob())
		.pipe(sass({ outputStyle: "expanded" }))
		.pipe(gulp.dest(`${project.dist}/css/`))
		.pipe(rename({ suffix: ".min" }))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(gulp.dest(`${project.dist}/css/`))
		.pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
	gulp.watch(`${project.assets}/*.html`, html);
	gulp.watch(`${project.scss}/**/*`, css);
	gulp.watch(`${project.img}/**/*`, images);
}

// define complex tasks
const build = gulp.series(
	clean,
	gulp.parallel(html, css, images, favicon, fonts)
);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
export { html, favicon, fonts, css, images, clean, build, watch };

export default build;
