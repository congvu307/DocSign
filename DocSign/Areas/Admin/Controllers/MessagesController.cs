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
    public class MessagesController : Controller
    {
        [Authorize]
        public void SendMyMail(string Subject, string ToEmail, string Body, string FromUser, string FromPass, string FileName)
        {
            MailMessage toUser = new MailMessage();
            
            toUser.From = new MailAddress("duongcongvu.com@gmail.com", "VteamHub", Encoding.UTF8);
            toUser.To.Add(ToEmail);
            if(FileName != "")
            {
                var path = "~/Content/document/" + Request.Cookies["username"].Value + "/" + FileName;
                Attachment attachment = new Attachment(Server.MapPath(path));
                toUser.Attachments.Add(attachment);
            }
            
            toUser.SubjectEncoding = Encoding.UTF8;
            toUser.Subject = "Vteam Hub document - " + Request.Cookies["username"].Value;
            toUser.BodyEncoding = Encoding.UTF8;
            toUser.IsBodyHtml = true;
            toUser.Body = Body;
            SmtpClient client = new SmtpClient("smtp.gmail.com", 587);
            client.Host = "smtp.gmail.com";
            client.UseDefaultCredentials = false;
            NetworkCredential netwo = new NetworkCredential();
            netwo.UserName = "duongcongvu.com@gmail.com";
            netwo.Password = "attackontitan";
            client.Credentials = netwo;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.EnableSsl = true;
            client.Send(toUser);
        }
        private ESignatureEntities db = new ESignatureEntities();

        [HttpPost]
        public ActionResult SendMail(string content, int documentID, string toEmail)
        {
            var document = db.Documents.Find(documentID);
            if (document != null)
            {
                SendMyMail("Tài liệu từ " + Request.Cookies["username"].Value, toEmail, content, "", "", document.FIleName);

            }
            else
            {
                SendMyMail("Tài liệu từ " + Request.Cookies["username"].Value, toEmail, content, "", "","");
            }
            e_Mess eMess = new e_Mess();
            eMess.Receiver = toEmail;
            eMess.Sender = Request.Cookies["username"].Value;
            eMess.IsRead = false;
            eMess.BodyContent = content;
            eMess.CreateDate = DateTime.Now;
            eMess.DocID = documentID;
            db.e_Mess.Add(eMess);
            db.SaveChanges();
            return RedirectToAction("Sent");
        }
        [Authorize]
        public ActionResult Inbox()
        {
            if (Request.Cookies["username"] == null)
            {
                return View();
            }
            var UserName = Request.Cookies["username"].Value;

            List<e_Mess> listMess = db.e_Mess.Where(x => x.Receiver == UserName).ToList();
            return View(listMess);
        }

        [Authorize]
        public ActionResult Sent()
        {
            if (Request.Cookies["username"] == null)
            {
                return View();
            }
            var UserName = Request.Cookies["username"].Value;

            List<e_Mess> listMess = db.e_Mess.Where(x => x.Sender == UserName).ToList();
            return View(listMess);
        }
        // GET: Admin/Messages
        [Authorize(Roles = "Admin")]
        public ActionResult Index()
        {
            var e_Mess = db.e_Mess.Include(e => e.Document);
            return View(e_Mess.ToList());
        }

        // GET: Admin/Messages/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            e_Mess e_Mess = db.e_Mess.Find(id);
            if (e_Mess == null)
            {
                return HttpNotFound();
            }
            return View(e_Mess);
        }

        // GET: Admin/Messages/Create
        public ActionResult Create()
        {
            ViewBag.DocID = new SelectList(db.Documents, "ID", "Url");
            return View();
        }

        // POST: Admin/Messages/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "ID,Receiver,Sender,IsRead,CreateBy,CreateDate,Note,Status,DocID")] e_Mess e_Mess)
        {
            if (ModelState.IsValid)
            {
                db.e_Mess.Add(e_Mess);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.DocID = new SelectList(db.Documents, "ID", "Url", e_Mess.DocID);
            return View(e_Mess);
        }

        // GET: Admin/Messages/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            e_Mess e_Mess = db.e_Mess.Find(id);
            if (e_Mess == null)
            {
                return HttpNotFound();
            }
            ViewBag.DocID = new SelectList(db.Documents, "ID", "Url", e_Mess.DocID);
            return View(e_Mess);
        }

        // POST: Admin/Messages/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "ID,Receiver,Sender,IsRead,CreateBy,CreateDate,Note,Status,DocID")] e_Mess e_Mess)
        {
            if (ModelState.IsValid)
            {
                db.Entry(e_Mess).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.DocID = new SelectList(db.Documents, "ID", "Url", e_Mess.DocID);
            return View(e_Mess);
        }

        // GET: Admin/Messages/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            e_Mess e_Mess = db.e_Mess.Find(id);
            if (e_Mess == null)
            {
                return HttpNotFound();
            }
            return View(e_Mess);
        }

        // POST: Admin/Messages/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            e_Mess e_Mess = db.e_Mess.Find(id);
            db.e_Mess.Remove(e_Mess);
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
