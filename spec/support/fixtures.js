(function (jasmine, undefined) { "use strict";

	var Fixtures = function () {
		this.path = 'spec/fixtures';
	};

	Fixtures.prototype.clear = function () {
		if (this.container && this.container.parentNode)
			this.container.parentNode.removeChild(this.container);

		this.container = null;
	};

	Fixtures.prototype.load = function (path) {
		this.set(this.html(path));
	};

	Fixtures.prototype.html = function (path) {
		var html
			, client = new XMLHttpRequest()
			, url = this.path.replace(new RegExp('/*$'), '/') + path.replace(new RegExp('/+', 'g'), '/');

		client.onreadystatechange = function () {
			if (client.readyState !== 4) return;
			if (client.status !== 200) throw new Error(
				'Fixture could not be loaded: ' + path
				+ ' (status: ' + client.status + ', message: ' + client.statusText + ')'
			);
			html = client.responseText;
		};
		client.open('GET', url, false);
		client.send();

		return html;
	};

	Fixtures.prototype.set = function (html) {
		this.clear();

		this.container = document.createElement('div');
		this.container.innerHTML = html;

		document.body.appendChild(this.container);
	};

	jasmine.fixtures = new Fixtures();

	afterEach(function () {
		jasmine.fixtures.clear();
	});

})(window.jasmine);
