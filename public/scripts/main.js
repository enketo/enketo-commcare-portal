// trying to unhook myself from jquery slowly

(function() {
	"use strict";

	var config;

	$(document).ready(function() {

		// setup jQuery Ajax (the only other use of jQuery)
		$.ajaxSetup({
			headers: {
				'X-OpenRosa-Version': '1.0'
			}
		});

		// set default inputs (that work)
		document.querySelector('#commcare-account').value = 'corpora';
		document.querySelector('#commcare-app-id').value = 'cc3315e9bdb5719c7b57d6ee5b19e797';
		document.querySelector('#update-list').onclick = updateList;

		// get configuration
		$.getJSON('/config.json', function(data) {
			config = data;
		});

	});


	function updateList(evt) {
		var suiteUrl,
			account = $('#commcare-account').val(),
			appId = $('#commcare-app-id').val(),
			listSection = document.querySelector('.main'),
			currentList = listSection.querySelector('#form-list'),
			progress = listSection.querySelector('.list-progress');

		if (!appId || !account) {
			console.error('no CommcareHQ Account and/or App Id provided');
			return;
		}

		if (currentList) {
			currentList.remove();
		}

		suiteUrl = "https://www.commcarehq.org/a/" + account + "/apps/download/" + appId + "/suite.xml";

		// disable button
		evt.target.setAttribute('disabled', 'disabled');

		// show progress bar
		progress.style.display = 'block';

		// obtain suite.xml from Commcare
		$.ajax({
			url: '/suite',
			data: {
				suite: suiteUrl
			},
			method: 'post',
			dataType: 'xml',
			success: function(suite) {
				listSection.appendChild(parseListFromSuite(suite, suiteUrl));
			},
			error: function(jqXHR, status, statusText) {
				alert('An error occurred when trying to obtain the suite (' + statusText + ')');
			},
			complete: function() {
				progress.style.display = 'none';
				evt.target.removeAttribute('disabled');
			}
		});
	}

	function parseListFromSuite(suite, suiteUrl) {
		var ul, li, a, clone, resource, loc, xformUrl;

		console.log('suite received', suite, suiteUrl);

		ul = document.createElement('ul');
		ul.setAttribute('id', 'form-list');
		li = document.querySelector('#enketo-li');
		a = li.content.querySelector('a');

		Array.prototype.slice.call(suite.querySelectorAll('suite > xform')).forEach(function(xform) {
			console.log('xform', xform);

			resource = xform.querySelector('resource');
			loc = resource.querySelector('location[authority="remote"]').textContent;
			xformUrl = suiteUrl.substring(0, suiteUrl.lastIndexOf('suite.xml')) + loc;

			a.id = resource.getAttribute('id');
			a.textContent = resource.getAttribute('descriptor');
			a.href = config.enketoFormPreviewUrl.replace('{xformUrl}', xformUrl);

			var clone = document.importNode(li.content, true);
			ul.appendChild(clone);

		});
		console.log('returning list', ul);
		return ul;
	}
})();
