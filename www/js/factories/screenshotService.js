angular.module('grisu-noe').factory('$screenshotService', function($q, $window) {
	return {
		capture: function (filename, extension, quality) {
			extension = extension || 'jpg';
			quality = quality || '100';

			var defer = $q.defer();

			if (!$window.cordova) {
				console.debug('Cordova not available: mocking success');
				defer.resolve('fake-file-path');
				return defer.promise;
			}

			navigator.screenshot.save(function(error, res) {
				if (error) {
					console.error('Error taking screenshot: ' + error);
					defer.reject(error);
				} else {
					console.debug('Screenshot saved in: ' + res.filePath);
					defer.resolve(res.filePath);
				}
			}, extension, quality, filename);

			return defer.promise;
		}
	};
});