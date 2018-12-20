using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Mvc;
using DocSign.Models;

namespace DocSign.Areas.Admin.Controllers
{
    public class DocumentsController : Controller
    {
        private ESignatureEntities db = new ESignatureEntities();


        

        // GET: Admin/Documents
        [Authorize]
        public ActionResult Document()
        {
            if (Request.Cookies["username"] == null)
            {
                return View();
            }
            var UserName = Request.Cookies["username"].Value;
            var listDoc = db.Documents.Where(x => x.CreateBy == UserName && x.Type == "Document").ToList();
            return View(listDoc);
        }
        [Authorize]
        public ActionResult Template()
        {
            if (Request.Cookies["username"] == null)
            {
                return View();
            }
            var UserName = Request.Cookies["username"].Value;
            var listDoc = db.Documents.Where(x => x.CreateBy == UserName &&x.Type == "Template").ToList();
            return View(listDoc);
        }

        [Authorize(Roles = "Admin")]
        public ActionResult Index()
        {
            return View(db.Documents.ToList());
        }

        // GET: Admin/Documents/Details/5
        [Authorize]
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Document document = db.Documents.Find(id);
            if (document == null)
            {
                return HttpNotFound();
            }
            if (Request.Cookies["username"] != null)
            {
                if (Request.Cookies["username"].Value != document.CreateBy)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }
            }
            return View(document);
        }

        // GET: Admin/Documents/Create
        [Authorize]
        public ActionResult Create()
        {
            return RedirectToAction("AddDoc","Home");
        }

        // POST: Admin/Documents/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "ID,Url,CreateBy,Note,Status,Privacy,DataUrl,FIleName,Type,CreateDate")] Document document)
        {
            if (ModelState.IsValid)
            {
                db.Documents.Add(document);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(document);
        }

        // GET: Admin/Documents/Edit/5
        [Authorize]
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Document document = db.Documents.Find(id);
            if (document == null)
            {
                return HttpNotFound();
            }
            return View(document);
        }

        // POST: Admin/Documents/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "ID,Url,CreateBy,Note,Status,Privacy,DataUrl,FIleName,Type,CreateDate")] Document document)
        {
            if (ModelState.IsValid)
            {
                db.Entry(document).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Document");
            }
            return View(document);
        }

        // GET: Admin/Documents/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Document document = db.Documents.Find(id);
            if (document == null)
            {
                return HttpNotFound();
            }
            return View(document);
        }

        // POST: Admin/Documents/Delete/5
        [HttpPost, ActionName("Delete")]
        [Authorize]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Document document = db.Documents.Find(id);
            db.Documents.Remove(document);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
