using DocSign.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace DocSign.Areas.Admin.Controllers
{
    public class LoginController : Controller
    {
        ESignatureEntities db = new ESignatureEntities();
        // GET: Admin/Login
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Register()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Register([Bind(Include = "UserName,Password,FullName,Address,CreateDate,Status,Note,DateOfBirth,Gender,Phone,PositionID,Email")] User user)
        {
            if (ModelState.IsValid)
            {
                user.Email = user.UserName;
                user.Status = true;
                user.PositionID = 2;
                db.Users.Add(user);
                db.SaveChanges();
            }
            ViewBag.Message = "Đăng ký thành công";
            return View();
        }

        [HttpPost]
        public string CheckUsername(string username)
        {
            var isUsernameExist = db.Users.Any(x => x.UserName == username);
            if (isUsernameExist)
            {
                return "tên đăng nhập đã tồn tại";
            }
            return "";
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Index(string username, string password, bool RememberMe = false)
        {
            if (Membership.ValidateUser(username, password) && ModelState.IsValid)
            {
                FormsAuthentication.SetAuthCookie(username, RememberMe);
                User user = db.Users.First(x => x.UserName == username);
                if (user != null)
                {
                    Response.Cookies["position"].Value = user.Position.Name;
                    Response.Cookies["position"].Expires = DateTime.Now.AddYears(1);
                    Response.Cookies["username"].Value = user.UserName;
                    Response.Cookies["username"].Expires = DateTime.Now.AddYears(1);
                }

                return RedirectToAction("DashBoard", "Home");
            }
            else
            {
                ModelState.AddModelError("", "Wrong username or password!");
            }
            return View();
        }
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            Response.Cookies["position"].Value = "";
            Response.Cookies["username"].Value = "";
            return RedirectToAction("Index", "Home");
        }
    }
}