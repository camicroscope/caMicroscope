let allSlides = [];
let selectedFilters = [];
function toggleCrossMenu(opt){
    if(opt.checked){
        openCrossMenu();
    } else {
        closeCrossMenu();
    }
}
function openCrossMenu() {
    const CrossMenu = document.getElementById('crossMenu');
    CrossMenu.classList.remove('none');
    CrossMenu.classList.add('display');
	initCrossMenu();
}
function closeCrossMenu() {
    const CrossMenu = document.getElementById('crossMenu');
    CrossMenu.classList.remove('display');
    CrossMenu.classList.add('none');
	$UI.toolbar.getSubTool('crossviewer').querySelector('input').checked = false;
}
function initCrossMenu() {
    allSlides = [];
	let filters = getUserFilter();
	let isWildcard = false;
	if (filters.length > 1 || (filters.length === 1 && filters[0] !== 'Public')) {
		selectedFilters = [];
		$("#filters-heading").html('<h5>Filters</h5>')
		$("#filters-check").html('');
		let val = "Public";
		createCheckbox(val);
		selectedFilters.push(val);
		for (let i = 0; i < filters.length; i++) {
			let val;
			if (filters[i] == '**') {
				isWildcard = true;
				continue;
			}
			else
				val = filters[i];
			selectedFilters.push(val);
			createCheckbox(val);
		}
		if(isWildcard)
		{
            val = 'Others';
            createCheckbox(val);
            selectedFilters.push(val);
		}
	}
	const params = getUrlVars();
	const store = new Store('../../data/');
	store.findSlide()
		.then(function (data) {
			if (data.length <= 1) {
				var div = document.querySelector('.cmContainer');
				div.textContent = `No Data Except Current Slide ... x _ x`;
				div.classList = `cmNoData`;
				return;
			}
			addHead();
			$("#search-table").on("keyup",filterCrossMenu);
			$(".sort-btn").on("click", sortCrossMenu);
            $('#cmTbody').html('');
            let currSlideID = getUrlVars().slideId;
			for (var i = 0; i < data.length; i++) {
                if(data[i]._id.$oid !== currSlideID){
                    const JSONdata = {
                        id : data[i]._id.$oid,
                        name : data[i].name,
                        study : data[i].study,
                        specimen : data[i].specimen,
                        mpp : data[i].mpp,
                        displayed : true,
                        location : data[i].location
                    };
                    if (data[i].filter) {
                        JSONdata.filterList = JSON.parse(data[i].filter.replace(/'/g, '"'));
                        if (!JSONdata.filterList.some((filter) => (filters.indexOf(filter) > - 1)))
                            JSONdata.filterList = ['Others'];
                    }
                    else {
                        JSONdata.filterList = ["Public"];
                    }
                    allSlides.push(JSONdata);
                    addBody(JSONdata);
                }					
			}
	});
}
function addHead(){
    $('#cmThead').html('');
	let tableHead = $('#cmThead');
	let headingList=['ID','Name','Study','Specimen', 'MPP'];
	let propList=['id','name','study','specimen', 'mpp'];
	const headingMarkup = headingList.map((title,i) => `<th>${title}
    <span class="sort-btn" data-order=${2} data-prop=${propList[i]}>
    <i class="fa fa-sort"/> </span>
    </th>`);
	headingMarkup.push("<th></th>")
	tableHead.append(`<tr>${headingMarkup}</tr>`);
}
function addBody(entry){
    let tableBody = $('#cmTbody');
	let button = `<td>	<button class=\"cmBtn\" data-id='${entry.id}' data-name='${entry.name}' data-location='${entry.location}' onclick='openCrossViewer(this)'><span class="material-icons">
    open_in_browser
    </span></button></td>`
	let markup = `<tr><td>${entry.id}</td><td>${entry.name}</td><td>${entry.study}</td><td>${entry.specimen}</td><td>${entry.mpp}</td>${button}</tr>`
	tableBody.append(markup);
}
function filterCrossMenu() {
	$('#cmTbody').html('');
	let value = String($("#search-table").val()).toLowerCase();
	let filters = getUserFilter();
	let filteredSlides;
	if (filters.length > 1 || (filters.length === 1 && filters[0] !== "Public")) {
		filteredSlides = allSlides.filter(function (slide) {
			var slideFilters = slide.filterList;
			let found = false;
			for (let i = 0; i < selectedFilters.length; i++) {
				if (slideFilters.indexOf(selectedFilters[i]) > -1) {
					found = true;
					break;
				}
			}
			if (!found)
				slide.displayed = false;
			return found;
		});
	}
	else
		filteredSlides = allSlides;
	const searchedSlides = filteredSlides.filter(function (slide) {
		var ind = (slide.id+" "+slide.name).toLowerCase().indexOf(value);
		if (ind > -1) {
			slide.displayed = true;
			return true;
		}
		else {
			slide.displayed = false;
			return false;
		}
	});
	searchedSlides.forEach(slide=>addBody(slide));
}
function sortCrossMenu(e) {
	$('#cmTbody').html('');
	var prop = e.currentTarget.dataset.prop;
	var order = parseInt(e.currentTarget.dataset.order);
	allSlides.sort(function (a, b) {

		let at = a[prop];
		let bt = b[prop];
		if(Array.isArray(at)&&Array.isArray(bt))
		{
			at=at.length;
			bt=bt.length;
		}
		else
		{
			at = at.toString().toLowerCase();
			bt = bt.toString().toLowerCase();
		}
		if (order === 1) {
			e.currentTarget.dataset.order=2;
			if (at > bt)
				return 1;
			else if (at < bt)
				return -1;
			else
				return 0;
		}
		else {
			e.currentTarget.dataset.order = 1;
			if (at < bt)
				return 1;
			else if (at > bt)
				return -1;
			else
				return 0;
		}
	})
	.filter(slide=>slide.displayed)
	.forEach(slide=> addBody(slide));
}
function createCheckbox(val)
{
$("#filters-check").append(`<div class="cmFilterCheck">
			<input name="filter-val" type="checkbox"
				class="form-check-input" onchange="handleFilterChange(this)" name=${val} id=${val} value=${val} checked="true">
		<label for=${val} class="form-check-label">
				${val}
				</label>
			</div>`);
}
function handleFilterChange(target) {
	let index = selectedFilters.indexOf(target.value);
	if (target.checked && index < 0) {
		selectedFilters.push(target.value);
		filterCrossMenu();
	}
	else
		if (!target.checked && index >= 0) {
			selectedFilters.splice(index, 1);
			filterCrossMenu();
	}
}
function openCrossViewer(elem){
	window.location.href = `../crossviewer/crossviewer.html?left=${getUrlVars().slideId}&right=${elem.dataset.id}`;
}
