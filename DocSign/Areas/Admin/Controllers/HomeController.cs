using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using System.Text;
using DocSign.Models;

namespace DocSign.Areas.Admin.Controllers
{
    public class HomeController : Controller
    {

        // GET: Admin/Home
        // Constants need to be set:
        private const string accessToken = "1b4252cb-3b36-4070-998c-fecc55c16142";
        private const string accountId = "bf68ad26-9990-44b5-b115-192a7a7f87a7";
        private const string signerName = "95c56553-9a3b-403f-91c0-84f338e57fa2";
        private const string signerEmail = "dcongvu307@gmail.com";
        private const string docName = "World_Wide_Corp_lorem.pdf";
        public ESignatureEntities db = new ESignatureEntities();
        public ActionResult CreateBlankDocument()
        {
            return View();
        }

        public string GetHTMLText(string sourceFilePath)
        {
            var filePath = System.IO.Path.Combine(Server.MapPath("~/App_Data"), "Employment_Agency.pdf");
            var sb = new StringBuilder();
            try
            {
                using (PdfReader reader = new PdfReader(filePath))
                {
                    string prevPage = "";
                    for (int page = 1; page <= reader.NumberOfPages; page++)
                    {
                        ITextExtractionStrategy its = new SimpleTextExtractionStrategy();
                        var s = PdfTextExtractor.GetTextFromPage(reader, page, its);
                        if (prevPage != s) sb.Append(s);
                        prevPage = s;
                    }
                    reader.Close();
                }
                var txt = sb.ToString();
                foreach (string s in txt.Split('\n'))
                {
                    sb.AppendFormat("<p>{0}</p>", s);
                }
                return sb.ToString();
            }
            catch (Exception e)
            {
                throw e;
            }

        }
        // Additional constants
        private const string basePath = "https://demo.docusign.net/restapi";

        [Authorize]
        public ActionResult AddDoc()
        {
            return View();
        }
        [Authorize]
        public ActionResult DashBoard()
        {
            if (Request.Cookies["username"] == null)
            {
                return View();
            }
            var UserName = Request.Cookies["username"].Value;
            var listDoc = db.Documents.Where(x => x.CreateBy == UserName).ToList();
            return View(listDoc);
        }

        [Authorize]
        [HttpPost]
        public ActionResult AddDoc(HttpPostedFileBase file, string privacy, string type)
        {
            try
            {
                if (file.ContentLength > 0)
                {
                    string _FileName = System.IO.Path.GetFileName(file.FileName);
                    string _FileExtension = System.IO.Path.GetExtension(_FileName);
                    if (_FileExtension == ".pdf")
                    {
                        var folder = Server.MapPath("~/Content/Document/"+ Request.Cookies["username"].Value);
                        if (!Directory.Exists(folder))
                        {
                            Directory.CreateDirectory(folder);
                        }
                        var _fileNameToSave = System.IO.Path.Combine(folder, _FileName);
                        file.SaveAs(_fileNameToSave);
                        Models.Document doc = new Models.Document();
                        doc.DataUrl = _fileNameToSave;
                        doc.Privacy = privacy;
                        doc.Type = type;
                        doc.CreateDate = DateTime.Now;
                        doc.FIleName = _FileName;
                        doc.CreateBy = Request.Cookies["username"] == null ? "" : Request.Cookies["username"].Value;
                        db.Documents.Add(doc);
                        file.SaveAs(_fileNameToSave);
                        db.SaveChanges();
                        return RedirectToAction("Document", "Documents");
                        
                    }
                    else
                    {
                        ViewBag.Message = "vui lòng tải lên file pdf";

                    }
                    return View();
                }
                else
                {
                    ViewBag.Message = "File rỗng";
                }
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Message = ex.ToString();
                return View();
            }
        }

        [Authorize]
        public ActionResult Index()
        {
            //string _fileNameToSave = Path.Combine(Server.MapPath("~/App_Data"), "Chapter1_Example1.pdf");
            //FileStream fs = new FileStream(_fileNameToSave, FileMode.Create, FileAccess.Write, FileShare.None);
            //Document doc = new Document();
            //PdfWriter writer = PdfWriter.GetInstance(doc, fs);
            //doc.Open();
            //doc.Add(new Paragraph("Hello World"));
            //doc.Close();
            //fs.Close();
            return View();
        }
    }
}