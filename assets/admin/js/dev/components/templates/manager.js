var TemplatesLayoutView = require( 'elementor-templates/views/layout' ),
	TemplatesCollection = require( 'elementor-templates/collections/templates' ),
	TemplatesManager;

TemplatesManager = function() {
	var self = this,
		modal,
		errorDialog,
		layout,
		templatesCollection;

	var initLayout = function() {
		layout = new TemplatesLayoutView();
	};

	this.deleteTemplate = function( templateModel ) {
		elementor.ajax.send( 'delete_template', {
			data: {
				type: templateModel.get( 'type' ),
				item_id: templateModel.get( 'id' )
			}
		} );

		templatesCollection.remove( templateModel );
	};

	this.importTemplate = function( templateModel ) {
		layout.showLoadingView();

		elementor.ajax.send( 'get_template_content', {
			data: {
				type: templateModel.get( 'type' ),
				post_id: elementor.config.post_id,
				item_id: templateModel.get( 'id' )
			},
			success: function( data ) {
				self.getModal().hide();

				elementor.getRegion( 'sections' ).currentView.addChildModel( data );
			},
			error: function( data ) {
				self.showErrorDialog( data.message );
			}
		} );
	};

	this.getErrorDialog = function() {
		if ( ! errorDialog ) {
			errorDialog = elementor.dialogsManager.createWidget( 'alert', {
				id: 'elementor-templates-error-dialog',
				headerMessage: elementor.translate( 'an_error_occurred' )
			} );
		}

		return errorDialog;
	};

	this.getModal = function() {
		if ( ! modal ) {
			modal = elementor.dialogsManager.createWidget( 'elementor-modal', {
				id: 'elementor-templates-modal',
				closeButton: false
			} );
		}

		return modal;
	};

	this.getLayout = function() {
		return layout;
	};

	this.getTemplatesCollection = function() {
		return templatesCollection;
	};

	this.requestRemoteTemplates = function( callback, forceUpdate ) {
		if ( templatesCollection && ! forceUpdate ) {
			if ( callback ) {
				callback();
			}

			return;
		}

		elementor.ajax.send( 'get_templates', {
			success: function( data ) {
				templatesCollection = new TemplatesCollection( data );

				if ( callback ) {
					callback();
				}
			}
		} );
	};

	this.startModal = function( onModalReady ) {
		self.getModal().show();

		// Set default templates type to 'local'
		elementor.channels.templates.reply( 'filter:type', 'local' );

		if ( ! layout ) {
			initLayout();
		}

		layout.showLoadingView();

		self.requestRemoteTemplates( function() {
			if ( onModalReady ) {
				onModalReady();
			}
		} );
	};

	this.showTemplates = function() {
		layout.showTemplatesView( templatesCollection );
	};

	this.showErrorDialog = function( errorMessage ) {
		self.getErrorDialog()
		    .setMessage( elementor.translate( 'templates_request_error' ) + '<div id="elementor-templates-error-info">' + errorMessage + '</div>' )
		    .show();
	};
};

module.exports = new TemplatesManager();