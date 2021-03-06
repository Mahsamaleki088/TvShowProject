const getTVshow = async (keyword, year) => {
  try {
    let result = await $.ajax({
      url: `https://api.themoviedb.org/3/discover/tv?api_key=${config.API_KEY}&sort_by=${keyword}&first_air_date_year=${year}`,
      type: "GET",
      dataType: "json",
    });
    return sanitizeData(result);
  } catch (error) {
    console.error(error);
  }
};

const sanitizeData = (data) => {
  let tvshowList = [];
  for (let i = 0; i < 12; i++) {
    tvshowList.push({
      id: data.results[i].id,
      title: data.results[i].name,
      image: (typeof data.results[i].backdrop_path === 'object') ? 'https://via.placeholder.com/500x281/9e9e9e/FFFFFF/?text=No image for this TV show' : `https://image.tmdb.org/t/p/w500${data.results[i].backdrop_path}`,
      voteAve: data.results[i].vote_average,
    });
  }
  return tvshowList;
};

const redirectToTvshowPage = () => {
  $('img').click(e => {
    const target = $(e.target);
    const id = target.attr('id');
    open(`./tvShowPage.html?id=${id}`, '_blank');
  })
}


const displayData = async (keyword = "popularity.desc", year = 2020) => {
  const getList = await getTVshow(keyword, year);
  $(".list").empty();

  getList.forEach((data) => {
    const itemDiv = $('<div class="tvshow_item"></div>');
    const img = $("<img>").attr("src", data.image).attr("alt", `TV show (${data.title})`).attr("id", data.id);
    const title = $("<h3></h3>").text(data.title);
    itemDiv.append(img);
    itemDiv.append(title);

    // vote average
    const progressIcon = $('<div class="progress_icon"></div>');
    const progressDiv = $('<div class="progress"></div>').attr("data-value", data.voteAve*10);
    const spanLeft = $('<span class="progress-left"></span');
    const spanRight = $('<span class="progress-right"></span');
    const spanBarLeft = $('<span class="progress-bar"></span>');
    const spanBarRight = $('<span class="progress-bar"></span>');
    
    if(data.voteAve*10 >= 80){
      spanBarLeft.addClass('border-success');
      spanBarRight.addClass('border-success');
    } else {
      spanBarLeft.addClass('border-warning');
      spanBarRight.addClass('border-warning');
    }

    spanLeft.append(spanBarLeft);
    spanRight.append(spanBarRight);
    const progressValue = $('<div class="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"></div>');
    const pValue = $('<div class="p font-weight-bold"></div>').text(data.voteAve*10);
    const sup = $('<sup class="small"></sup>').text('%')
    pValue.append(sup);
    progressValue.append(pValue);
    progressDiv.append(spanLeft);
    progressDiv.append(spanRight);
    progressDiv.append(progressValue);
    progressIcon.append(progressDiv);
    itemDiv.append(progressIcon);

    $(".list").append(itemDiv);
  });

  $(".progress").each(function () {
    var value = $(this).attr("data-value");
    var left = $(this).find(".progress-left .progress-bar");
    var right = $(this).find(".progress-right .progress-bar");
  
    if (value > 0) {
      if (value <= 50) {
        right.css("transform", "rotate(" + percentageToDegrees(value) + "deg)");
      } else {
        right.css("transform", "rotate(180deg)");
        left.css(
          "transform",
          "rotate(" + percentageToDegrees(value - 50) + "deg)"
        );
      }
    }
  });

  redirectToTvshowPage();
};

// For progress bar
const percentageToDegrees = (percentage) => {
  return (percentage / 100) * 360;
}


getTVshow()
  .then(() => {
    displayData();
  })
  .then(() => {
    let keyword, year;
    $("input").change((e) => {
      year = $(e.target).val();
      displayData(keyword, year);
    })
    $("select").change((e) => {
      keyword = $(e.target).val();
      displayData(keyword, year);
    });
  });
