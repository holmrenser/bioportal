var ITEMS_INCREMENT = 40;
Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Session.setDefault('select-all',false);
Meteor.subscribe('tracks');
Tracker.autorun(function(){
  Meteor.subscribe('genes',Session.get('itemsLimit'),Session.get('search'),Session.get('filter'));
})

Template.genelist.helpers({
  genes: function(){
    const query = Session.get('filter') || {};
    const search = Session.get('search')
    if (search) {
      query.$or = [{'ID':{$regex:search}},{'Name':{$regex:search}}];
      if (!query.hasOwnProperty('Productname')){
        query.$or.push({'Productname':{$regex:search}})
    }
  }
    return Genes.find(query,{sort:{'ID':1}});
  },
  transcripts: function(){
    const transcripts = this.subfeatures.filter(function(x){ return x.type === 'mRNA' });
    return transcripts
  },
  moreResults: function(){
    // If, once the subscription is ready, we have less rows than we
    // asked for, we've got all the rows in the collection.
    return !(Genes.find({'type':'gene'}).count() < Session.get("itemsLimit"));
  },
  hasFilter: function(){
    const filter = Session.get('filter')
    return filter;
  },
  isChecked: function(){
    if (Session.get('select-all')){
      return 'checked'
    } else {
      const id = this.ID;
      const checked = Session.get('checked');
      if (typeof checked === 'undefined'){
        return 'unchecked'
      } else if (checked.indexOf(id) >= 0){
        return 'checked';
      } else {
        return 'unchecked'
      }
    }
  },
  selectAll: function(){
    if (Session.get('select-all')){
      return 'checked'
    } else {
      return 'unchecked'
    }
  },
  tracks:function(){
    //console.log(Tracks.find({}).fetch());
    return Tracks.find({});
  },
  formatTrackName:function(trackName){
    return trackName.split('.')[0];
  },
  confidence:function(){
    if (this.one_to_one_orthologs === 'High confidence') {
      return 'label-success'
    } else {
      return 'label-danger'
    }
    //return confidence
  }
});

Template.genelist.events({
  'click input.ternary-toggle[type=checkbox]': function(event){
    console.log(event.target)
    toggleSwitch(event.target)
  },
  "click .genelink": function(){
    /*
    var id = this._id._str;
    console.log(this);
    var _expanded = Session.get('expand');
    var expanded = _expanded ? _expanded.slice(0) : [];
    var wasExpanded = expanded.indexOf(id);
    if (wasExpanded < 0) {
      expanded.push(Id);
    }
    */
  },
  "submit #genelist_filter": function(event){
    event.preventDefault();
    //empty object to initialize filter
    const filter = {}
    //check if anything in gene_id textarea
    const gene_id_string = $('#gene_id_filter').get(0).value;
    const filter_gene_ids = gene_id_string ? gene_id_string.split('\n') : [];
    if (filter_gene_ids.length > 0){
      console.log(filter_gene_ids)
      filter.ID = {$in:filter_gene_ids}
      //filter.ID = filter_gene_ids
    }
    //check track checkboxes
    const tracks = Tracks.find({}).fetch();
    const trackNames = tracks.map(function(x){return x.track.split('.')[0]});
    const filter_tracks = []
    for (var i in trackNames){
      const trackName = trackNames[i];
      const trackButton = $('.track-checkbox#'+trackName);
      if (trackButton.is(':checked')){
        filter_tracks.push(tracks[i].track)
      }
    }
    if (filter_tracks.length > 0){
      //console.log(filter_tracks)
      filter.track = {$in:filter_tracks}
      //filter.tracks = filter_tracks
    }

    //check productname radiobuttons
    if ($('.productname-radio#product-yes').is(':checked')){
      console.log('productname yes')
      filter['Productname'] = {$ne:'None'};
    } else if ($('.productname-radio#product-no').is(':checked')){
      console.log('productname no')
      filter['Productname'] = 'None'
    } else if ($('.productname-radio#product-idc').is(':checked')){
      console.log('productname dont care')
      if (filter.hasOwnProperty('productname')){
        delete filter['Productname'];
      }
    }

    //check manual radiobuttons
    if ($('.manual-radio#manual-yes').is(':checked')){
      filter['Name'] = {$exists:true};
    } else if ($('.manual-radio#manual-no').is(':checked')){
      filter['Name'] = {$exists:false};
    } else if ($('.manual-radio#manual-idc').is(':checked')){
      if (filter.hasOwnProperty('Name')){
        delete filter['Name'];
      }
    }

    console.log('filter submit');
    console.log(filter);
    if (Object.keys(filter).length > 0){
          Session.set('filter',filter);
    }
  },
  "click .reset_filter": function(event){
    event.preventDefault();
    Session.set('filter',false);
    Session.set('select-all',false);
    Session.set('checked',[]);
  },
  "click .export-data":function(event,template){
    $(event.target).button('loading');
    let name        = 'name',   //Meteor.user().profile.name,
        fileName    = 'fileName'   //`${name.first} ${name.last}`,
        //profileHtml = Modules.client.getProfileHTML();
        /*
    Meteor.call('exportData',profileHtml,(error,response) => {
      if (error) {
        Bert.alert( error.reason, 'warning' );
      } else if ( response ) {
      // We'll handle the download here.
      }
    })
    */
  },
  "click .select-gene":function(){
    console.log(this);
    const id = this.ID;
    const _checked = Session.get('checked');
    const checked = _checked ? _checked.slice(0) : [];
    const wasChecked= checked.indexOf(id);
    if (wasChecked < 0) {
      checked.push(id);
    } else {
      checked.splice(wasChecked,1);
    }
    Session.set('checked',checked)
  },
  "click .select-all":function(){
    const selectAll = Session.get('select-all');
    Session.set('select-all',!selectAll);
  }
});

Template.genelist.rendered = function(){
  const input = document.getElementById('slider')
  
  noUiSlider.create(input,{
    start: [20,80],
    connect: true,
    range: {
      'min': [0],
      'max': [100]
    }
  })
}

// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
    var threshold, target = $('#showMoreGenes');
    
    if (!target.length) return;
    
    threshold = $(window).scrollTop() + $(window).height() - target.height();

    if (target.offset().top <= threshold) {
        if (!target.data("visible")) {
            // console.log("target became visible (inside viewable area)");
            target.data("visible", true);
            Session.set("itemsLimit",
                Session.get("itemsLimit") + ITEMS_INCREMENT);
        }
    } else {
        if (target.data("visible")) {
            // console.log("target became invisible (below viewable arae)");
            target.data("visible", false);
        }
    }        
}
// run the above func every time the user scrolls
$(window).scroll(showMoreVisible)

//toggle between checked/unchecked/indeterminate for checkboxes to determine query yes/no/don't care
function toggleSwitch(checkbox) {
  const parent = $(checkbox).parent();
  console.log(parent);
  if (checkbox.readOnly){
    //go from negative to unchecked
    parent.removeClass('checkbox-danger');
    checkbox.checked=checkbox.readOnly=false;
  } else if (!checkbox.checked){
    //go from positive to negative
    parent.addClass('checkbox-danger');
    parent.removeClass('checkbox-success');
    checkbox.readOnly=checkbox.checked=true;
  } else {
    //go from unchecked to positive
    parent.addClass('checkbox-success');
    parent.removeClass('checkbox-danger');

 }
}
 



