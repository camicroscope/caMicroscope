let allSlides = [];
let selectedFilters = [];

function ToggleCrossMenu(opt){
    if(opt.checked){
        OpenCrossMenu();
    } else {
        CloseCrossMenu();
    }
}
function OpenCrossMenu() {
    const CrossMenu = document.getElementById('crossMenuWrapper');
    CrossMenu.classList.remove('none');
    CrossMenu.classList.add('display');
	InitCrossMenu();
}
function CloseCrossMenu() {
    const CrossMenu = document.getElementById('crossMenuWrapper');
    CrossMenu.classList.remove('display');
    CrossMenu.classList.add('none');
	$UI.toolbar.getSubTool('crossviewer').querySelector('input').checked = false;
}
function InitCrossMenu() {
    allSlides = [];
	let filters = getUserFilter();
	let isWildcard = false;
	if (filters.length > 1 || (filters.length === 1 && filters[0] !== 'Public')) {
		selectedFilters = [];
		$("#crossMenuFiltersHeading").html('<h5>Filters</h5>')
		$("#crossMenuFiltersCheck").html('');
		let val = "Public";
		CreateCheckbox(val);
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
			CreateCheckbox(val);
		}
		if(isWildcard)
		{
            val = 'Others';
            CreateCheckbox(val);
            selectedFilters.push(val);
		}
	}
	const params = getUrlVars();
	const store = new Store('../../data/');
	store.findSlide()
		.then(function (data) {
			if (data.length <= 1) {
				var div = document.querySelector('.crossMenuContainer');
				div.textContent = `No Data Except Current Slide ... x _ x`;
				div.classList = `crossMenuNoData`;
				return;
			}
			AddHead();
			$("#crossMenuSearchTable").on("keyup",FilterCrossMenu);
			$(".crossMenuSortBtn").on("click", SortCrossMenu);
            $('#crossMenuTbody').html('');
			$('#crossMenuTablePagesList').html('');
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
                    //AddBody(JSONdata);
                }					
			}
			Pagination(allSlides);
	});
}
function AddHead(){
    $('#crossMenuThead').html('');
	let tableHead = $('#crossMenuThead');
	let headingList=['ID','Name','Study','Specimen', 'MPP'];
	let propList=['id','name','study','specimen', 'mpp'];
	const headingMarkup = headingList.map((title,i) => `<th>${title}
    <span class="crossMenuSortBtn" data-order=${2} data-prop=${propList[i]}>
    <i class="fa fa-sort"/> </span>
    </th>`);
	headingMarkup.push("<th></th>")
	tableHead.append(`<tr>${headingMarkup}</tr>`);
}
function AddBody(entry, display = ""){
    let tableBody = $('#crossMenuTbody');
	let button = `<td>	<button class=\"crossMenuBtn\" data-id='${entry.id}' data-name='${entry.name}' data-location='${entry.location}' onclick='OpenCrossViewer(this)'><span class="material-icons">
    open_in_browser
    </span></button></td>`
	let markup = `<tr style="display:${display}"><td>${entry.id}</td><td>${entry.name}</td><td>${entry.study}</td><td>${entry.specimen}</td><td>${entry.mpp}</td>${button}</tr>`
	tableBody.append(markup);
}
function FilterCrossMenu() {
	$('#crossMenuTbody').html('');
	$('#crossMenuTablePagesList').html('');
	let value = String($("#crossMenuSearchTable").val()).toLowerCase();
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
	//searchedSlides.forEach(slide=>AddBody(slide));
	Pagination(searchedSlides);
}
function SortCrossMenu(e) {
	$('#crossMenuTbody').html('');
	$('#crossMenuTablePagesList').html('');
	var prop = e.currentTarget.dataset.prop;
	var order = parseInt(e.currentTarget.dataset.order);
	Pagination(allSlides.sort(function (a, b) {

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
	);
}
function CreateCheckbox(val)
{
$("#crossMenuFiltersCheck").append(`<div class="crossMenuFilterCheck">
			<input name="filter-val" type="checkbox"
				class="form-check-input" onchange="HandleFilterChange(this)" name=${val} id=${val} value=${val} checked="true">
		<label for=${val} class="form-check-label">
				${val}
				</label>
			</div>`);
}
function HandleFilterChange(target) {
	let index = selectedFilters.indexOf(target.value);
	if (target.checked && index < 0) {
		selectedFilters.push(target.value);
		FilterCrossMenu();
	}
	else
		if (!target.checked && index >= 0) {
			selectedFilters.splice(index, 1);
			FilterCrossMenu();
	}
}
function OpenCrossViewer(elem){
	window.location.href = `../crossviewer/crossviewer.html?main=${getUrlVars().slideId}&minor=${elem.dataset.id}`;
}
function Pagination(slidesArray){
	var slidesPerPage = parseInt(document.getElementById("crossMenuEntries").value);
	if(slidesPerPage >= slidesArray.length){
		slidesArray.forEach(slide => AddBody(slide));
		return;
	}
	else {
		for(let i = 1; i <= slidesArray.length; i++){
			if(i > slidesPerPage){
				AddBody(slidesArray[i-1], 'none');
			} else {
				AddBody(slidesArray[i-1]);
			}
		}
		const numOfPages = Math.ceil(slidesArray.length / slidesPerPage);
		const footer = document.getElementById("crossMenuTablePagesList");
		for(let i = 0; i <= numOfPages + 1; i++){
			let li = null;
			let a = null;
			if(i == 0){
				li = document.createElement("li");
				a = document.createElement("a");
				a.classList.add("crossMenuPageLink");
				a.innerHTML = "Previous";
				li.classList.add("crossMenuPageItem");
				li.id = "crossMenuPreviousPage";
				li.appendChild(a);
				li.addEventListener('click', () => {
					var perPage = parseInt(document.getElementById("crossMenuEntries").value);
					var currPage = parseInt(document.getElementById("crossMenuPreviousPage").dataset.currPage);
					if(currPage == 1){
						return;
					}
					let table = document.getElementById('crossMenuTbody');
					for(let j = 1; j < footer.children.length-1; j++){
						footer.children[j].classList.remove('active');
						if(j == (currPage-1)){
							footer.children[j].classList.add('active');
						}
					}
					for(let j = 0; j < table.children.length; j++){
						table.children[j].style.display = 'none';
					}
					for(let j = (currPage - 2) * perPage; j < Math.min(table.children.length, (currPage - 1) * perPage); j++){
						table.children[j].style.display = '';
					}
					document.getElementById("crossMenuPreviousPage").dataset.currPage = currPage - 1;
				});
			} else if(i <= numOfPages){
				li = document.createElement("li");
				a = document.createElement("a");
				a.classList.add("crossMenuPageLink");
				a.innerHTML = i;
				li.classList.add("crossMenuPageItem", "pages");
				if(i == 1){
					document.getElementById("crossMenuPreviousPage").dataset.currPage = i;
					li.classList.add("active");
				}	
				li.appendChild(a);
				li.addEventListener('click', () => {
					var perPage = parseInt(document.getElementById("crossMenuEntries").value);
					document.getElementById("crossMenuPreviousPage").dataset.currPage = i;
					let table = document.getElementById('crossMenuTbody');
					for(let j = 1; j < footer.children.length-1; j++){
						footer.children[j].classList.remove('active');
					}
					for(let j = 0; j < table.children.length; j++){
						table.children[j].style.display = 'none';
					}
					for(let j = (i - 1) * perPage; j < Math.min(table.children.length, (i) * perPage); j++){
						table.children[j].style.display = '';
					}
					li.classList.add('active');
				});
			} else{
				li = document.createElement("li");
				a = document.createElement("a");
				a.classList.add("crossMenuPageLink");
				a.innerHTML = "Next";
				li.classList.add("crossMenuPageItem");
				li.id = "crossMenuNextPage";
				li.appendChild(a);
				li.addEventListener('click', () => {
					var perPage = parseInt(document.getElementById("crossMenuEntries").value);
					var currPage = parseInt(document.getElementById("crossMenuPreviousPage").dataset.currPage);
					if(currPage == (numOfPages)){
						return;
					}
					let table = document.getElementById('crossMenuTbody');
					for(let j = 1; j < footer.children.length-1; j++){
						footer.children[j].classList.remove('active');
						if(j == (currPage + 1)){
							footer.children[j].classList.add('active');
						}
					}
					for(let j = 0; j < table.children.length; j++){
						table.children[j].style.display = 'none';
					}
					for(let j = (currPage) * perPage; j < Math.min(table.children.length, (currPage + 1) * perPage); j++){
						table.children[j].style.display = '';
					}
					document.getElementById("crossMenuPreviousPage").dataset.currPage = currPage + 1;
				});
			}
			
			footer.appendChild(li);
		}
	}
}