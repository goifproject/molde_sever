let request = require("request");

// 여성 안심 서비스
let fs = require("fs");
let path = require("path");
let number_arr = new Array(); // 숫자
let brand_arr = new Array(); // 브랜드
let spot_arr = new Array();  // 자치구
let jumpo_arr = new Array(); // 점포명
let addr_arr = new Array(); // 주소명
let lat_arr = new Array(); // 위도
let lon_arr = new Array(); // 경도
let date_addr = new Array(); // 신고 날짜
let detail_addr = new Array(); // 상세주소

let data_arr_by_rn = new Array(); // 데이터 구분(\r\n)으로 자름
let sendData = new Array();
let report_addr = new Array();
/*
Multiparty
*/

let multiparty = require("multiparty");


let file1 = path.join(__dirname,"../read_file/seoul_mapo_female_safety.csv");
module.exports = function(router){
    router.get("/report",function (req,res,next) {
        fs.readFile(file1,"UTF-8",function (err,data) {
            if(err) console.error(new Error(err));
            else{
                let data_object = {};
                data_arr_by_rn = data.split("\n");
                for(var elem in data_arr_by_rn){
                    number_arr[elem] = data_arr_by_rn[elem].split(",")[0];
                    brand_arr[elem] = data_arr_by_rn[elem].split(",")[1];
                    spot_arr[elem] = data_arr_by_rn[elem].split(",")[2];
                    jumpo_arr[elem] = data_arr_by_rn[elem].split(",")[3];
                    addr_arr[elem] = data_arr_by_rn[elem].split(",")[4];
                    lat_arr[elem] = data_arr_by_rn[elem].split(",")[5];
                    lon_arr[elem] = data_arr_by_rn[elem].split(",")[6];
                    date_addr[elem] = data_arr_by_rn[elem].split(",")[7];
                    detail_addr[elem] = data_arr_by_rn[elem].split(",")[8];
                }

		console.log("갯수 : " + number_arr.length);

                for(var i=0;i<number_arr.length;i++){
                    var json_obj = new Object();
                    json_obj.rep_id = number_arr[i];
                    json_obj.rep_nm = brand_arr[i];
                    json_obj.rep_contents = spot_arr[i];
                    json_obj.rep_state = jumpo_arr[i];
                    json_obj.rep_addr = addr_arr[i];
                    json_obj.rep_lat = lat_arr[i];
                    json_obj.rep_lon = lon_arr[i];
                    json_obj.rep_date = date_addr[i];
                    json_obj.rep_detail_addr = detail_addr[i];
	            json_obj.rep_img = "https://moldebucket.s3.ap-northeast-2.amazonaws.com/report_image/seongho.jpg"
                    sendData.push(json_obj);
		        
                }
   		for(var i=0;i<sendData.length;i++){
		    console.log(sendData[i]);
		}
		
		console.log(sendData.length);
	        let json_feed = { 
		    feed : sendData
                }
		
         //       let jsonData = JSON.stringify(json_feed);
                console.log(json_feed);
                res.status(200).send((json_feed));
            }
        });
    })
};
