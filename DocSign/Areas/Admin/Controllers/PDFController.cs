using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DocSign.Areas.Admin.Controllers
{
    [RoutePrefix("Pdf")]
    public class PDFController : Controller
    {
        [Route("{id}")]
        [AllowAnonymous]
        public ActionResult GetPDF(int id)
        {
            //...Code to extract pdf from SQLServer and store in stream
            string fileDir = Path.Combine(Server.MapPath("~/App_Data"), "Employment_Agency.pdf");
            return File(fileDir,  "Employment_Agency.pdf");
        }
    }
}