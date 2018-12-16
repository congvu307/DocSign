using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
namespace DocSign.Models
{
    public class InvoiceModel
    {
        [Display(Name = "Customer Name")]
        public string CustomerName { get; set; }
        [Display(Name = "Transaction Ref.")]
        public string TransactionRef { get; set; }
        [Display(Name = "Transaction Date")]
        public string TransactionDate { get; set; }
        [Display(Name = "Transaction Amount")]
        public string TransactionAmount { get; set; }
        public string Status { get; set; }
    }
}