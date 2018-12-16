using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using DocSign.Models;

namespace DocSign.Areas.Admin.Controllers
{
    public class SignaturesController : Controller
    {
        private ESignatureEntities db = new ESignatureEntities();
        // GET: Admin/Signatures
        public ActionResult Index()
        {
            var USER_NAME = Request.Cookies["position"];
            var username = Request.Cookies["username"].Value;
            if (USER_NAME != null)
            {
                if (USER_NAME.Value == "Admin")
                {
                    return View(db.Signatures.ToList());
                }
                var signatures = db.Signatures.Where(x=>x.CreateBy == username).Include(s => s.User);
                return View(signatures.ToList());
            }
            return View();
        }

        // GET: Admin/Signatures/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Signature signature = db.Signatures.Find(id);
            if (signature == null)
            {
                return HttpNotFound();
            }
            return View(signature);
        }

        // GET: Admin/Signatures/Create
        public ActionResult Create()
        {
            ViewBag.CreateBy = new SelectList(db.Users, "UserName", "Password");
            return View();
        }

        // POST: Admin/Signatures/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "SignContent,CreateBy,CreateDate,Note,Status,ID")] Signature signature)
        {
            if (ModelState.IsValid)
            {
                signature.Status = "Eable";
                signature.CreateDate = DateTime.Now;
                db.Signatures.Add(signature);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.CreateBy = new SelectList(db.Users, "UserName", "Password", signature.CreateBy);
            return View(signature);
        }

        // GET: Admin/Signatures/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Signature signature = db.Signatures.Find(id);
            if (signature == null)
            {
                return HttpNotFound();
            }
            ViewBag.CreateBy = new SelectList(db.Users, "UserName", "Password", signature.CreateBy);
            return View(signature);
        }

        // POST: Admin/Signatures/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "SignContent,CreateBy,CreateDate,Note,Status,ID")] Signature signature)
        {
            if (ModelState.IsValid)
            {
                db.Entry(signature).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.CreateBy = new SelectList(db.Users, "UserName", "Password", signature.CreateBy);
            return View(signature);
        }

        // GET: Admin/Signatures/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Signature signature = db.Signatures.Find(id);
            if (signature == null)
            {
                return HttpNotFound();
            }
            return View(signature);
        }

        // POST: Admin/Signatures/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Signature signature = db.Signatures.Find(id);
            db.Signatures.Remove(signature);
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
