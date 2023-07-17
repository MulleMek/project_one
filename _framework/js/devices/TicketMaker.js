var TicketMaker = (function( $, Environment ) {
	
	const PATH = Environment.get('domains.services') + '/ticket';
	const done_event = "TicketMaker/get/done";

	function get( name, data ) {
		//var address = PATH + '/' + name + '.html';
		var address = PATH + '/' + name;
		console.log(address);
		data = data || {};
	
		return new Promise( function( resolve, reject ){
			var x = new XMLHttpRequest();
			x.onreadystatechange = function () {
			  if (x.readyState != 4 ) return;
			  if ( x.status != 200) return reject();
			  resolve( x.responseText );
			};
			x.open("POST", address);
			x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
			x.send(JSON.stringify(data));
		})
		.then( str => str.replace(/[\r\n\t]{1,}/g, " "))
		.then( str => ( $.publish( done_event, [str]), str ) );
	};


	return { get: get };
})( $, Environment );

/*
TicketMaker.get('ticket', {price: 1000, delivery: 100});
 
EventManager.subscribe('TicketMaker/get/done', function( event, data ) {
	$('body').html(data);
});
 */